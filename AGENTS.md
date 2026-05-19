# LidoPro Agent Rules

## Repository language is English

Any new documentation, README copy, code comments, and repository-facing text must be written in English.

User-facing application copy remains Italian-first and should go through the existing i18n or product-copy structure where appropriate.

Future UI changes must not hardcode mixed-language strings unless the mixed wording is intentionally part of canonical product terminology.

Completion messages must report whether a wave introduces new user-facing copy and whether that copy is Italian-first and i18n-ready.

## Canonicalization before implementation

Before every delivery wave, inventory the existing implementation first.

For schemas, tables, models, repositories, services, routes, components, seeds, fixtures, and documentation:
- identify the current canonical owner;
- identify stale, dead, duplicate, half-implemented, or unused structures;
- extend or refactor the existing owner before creating a new boundary;
- remove or demote obsolete structures when it is safe and in scope;
- do not create a parallel subsystem without a migration/deprecation plan;
- document table/schema canonicalization decisions before adding migrations or repositories;
- update `docs/architecture/product-spine.md` after major deliveries when real project status changes.

New tables, runtime models, and domain services must map explicitly to existing data and legacy concepts. If old code cannot be removed safely in the same wave, mark the ownership and deprecation path clearly.

## Responsive validation is mandatory for UI work

Any wave that changes UI, layout, navigation, map, panels, forms, tables, modals, drawers, sheets, or typography must validate responsive behavior. Desktop-only validation is not sufficient.

### Responsive layout policy

Use these layout families:

- Desktop and tablet landscape share the same base layout family.
- Tablet landscape is desktop-compact, not full desktop: keep the main structure, but reduce density, avoid oversized side gutters, keep touch targets usable, and do not depend on hover-only interactions.
- Tablet portrait is its own layout family. Do not treat it as a squeezed desktop. Prefer fewer columns, clearer vertical hierarchy, and panels that scroll internally.
- Smartphone portrait is mobile-first: one-column flow, no persistent desktop sidebars in operational workspaces, no desktop panels compressed sideways, and primary actions must remain reachable.
- Smartphone landscape is height-constrained: keep sheets/panels compact, preserve the core map/work area, and avoid header or toolbar stacks that consume the viewport.

Rule:
If a UI only works by shrinking desktop columns until text clips or overlaps, the responsive implementation is wrong.

### Practical validation workflow

During development, validate in this order:

1. Desktop window at normal size for desktop landscape.
2. Desktop window narrowed to tablet-landscape-like widths for desktop-compact/tablet landscape behavior.
3. Browser responsive mode or emulator at tablet portrait sizes.
4. Browser responsive mode or emulator at smartphone portrait sizes.
5. Smartphone landscape or short-height viewport for bottom sheets, side panels, toolbars, and maps.

The desktop-narrow check is useful for tablet landscape, but it does not replace tablet portrait or smartphone validation.

## Avoid card-heavy UI

Do not use cards as the default way to organize interface content.

Cards are allowed only for repeated items, modals, and genuinely framed tools. Do not put cards inside sheets or panels just to separate content. Prefer clean hierarchy, spacing, dividers, columns, tables/lists, and task areas that sit directly in the surface.

For operator workflows such as Spiaggia, Booking, Conti/Folio, Registro, Staff, and Servizi:
- avoid card-in-card layouts;
- avoid large bordered boxes around every task area;
- avoid decorative shadows and rounded containers that make operational screens feel cheap or generic;
- use compact structure, clear section rhythm, and direct controls instead.

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
- desktop and tablet landscape keep a coherent desktop-compact structure
- tablet portrait is not treated as squeezed desktop
- smartphone portrait has verticalized layout
- smartphone portrait does not show persistent desktop sidebars in operational workspaces
- smartphone landscape does not lose core navigation
- browser fallback does not define product quality by itself
