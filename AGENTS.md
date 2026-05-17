# LidoPro Agent Rules

## Repository language is English

Any new documentation, README copy, code comments, and repository-facing text must be written in English.

User-facing application copy remains Italian-first and should go through the existing i18n or product-copy structure where appropriate.

Future UI changes must not hardcode mixed-language strings unless the mixed wording is intentionally part of canonical product terminology.

Completion messages must report whether a wave introduces new user-facing copy and whether that copy is Italian-first and i18n-ready.

## Responsive validation is mandatory for UI work

Any wave that changes UI, layout, navigation, map, panels, forms, tables, modals, drawers, sheets, or typography must validate responsive behavior. Desktop-only validation is not sufficient.

Browser responsive mode is acceptable for early checks. Tauri compressed windows are acceptable for desktop and tablet-like checks. Android Studio or a physical Android device, and Xcode Simulator or a physical iPad/iPhone, are required for final native validation when available. If native validation is not available, the completion message must explicitly say so.

### Canonical Responsive Matrix

Desktop landscape:
- 1440 x 900
- 1280 x 800

Tablet landscape:
- 1180 x 820
- 1138 x 712
- 1024 x 768

Tablet portrait:
- 820 x 1180
- 768 x 1024

Smartphone portrait:
- 430 x 932
- 390 x 844
- 360 x 800

Smartphone landscape:
- 844 x 390
- 932 x 430

### Acceptance Checks

For every touched screen or panel:
- no horizontal overflow
- no clipped primary content
- no overlapped text
- no controls covering critical content
- bottom sheets and side panels scroll internally
- map remains visible and operable
- primary actions remain reachable
- touch targets remain usable
- tablet portrait is not treated as squeezed desktop
- smartphone portrait has verticalized layout
- smartphone landscape does not lose core navigation
- browser fallback does not define product quality by itself
