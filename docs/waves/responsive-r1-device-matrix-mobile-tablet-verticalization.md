# RESPONSIVE.R1 - Device Matrix / Mobile-Tablet Verticalization

## Problem

Recent tablet and phone checks showed responsive regressions in the operational map experience:
- tablet landscape was mostly usable, but the bottom panel could consume too much space
- smartphone portrait showed overlapping selected-place detail text
- floating map controls could collide with detail panels
- orientation changes exposed clipped side content and desktop assumptions
- future UI waves lacked a permanent responsive validation rule

## Repository Rule

This wave introduced a permanent repository rule in `AGENTS.md`: every UI-changing wave must validate the LidoPro responsive matrix and report what was checked.

## Matrix

- Desktop: 1440 x 900, 1280 x 800
- Tablet landscape: 1180 x 820, 1138 x 712, 1024 x 768
- Tablet portrait: 820 x 1180, 768 x 1024
- Smartphone portrait: 430 x 932, 390 x 844, 360 x 800
- Smartphone landscape: 844 x 390, 932 x 430

## UI Areas Corrected

- Operational bottom sheet height and internal scrolling for tablet/phone.
- Selected item header verticalization on narrow screens.
- Booking dossier/workspace layout on narrow screens.
- Floating map control density and safe placement around the bottom sheet.
- App header/wordmark compact behavior on phone.

## Deferred Validation

Native Android and iOS validation require Android Studio/device and Xcode/iOS Simulator or physical devices. If unavailable in the current wave, browser/Tauri responsive checks are acceptable as a corrective pass and native validation must be reported as deferred.
