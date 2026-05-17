# LidoPro Naming

This document defines the canonical naming model for the product and repository-facing language.

## Canonical Product Name

**LidoPro** is the full commercial product name.

Use LidoPro when referring to the complete proprietary commercial local-first beach management application.

## Module Names

Canonical module naming:

- **Lido Studio**: beach map, layout planning, sketch/canvas, and parametric design.
- **Lido Booking**: reservation and daily operational booking workflows.
- **Lido Clienti**: customer registry, assignments, customer history, and profiles.
- **Lido Listino**: pricing, catalog, extras, tariff rules, and suggestions.
- **Lido Pay**: future payment integrations. Not live.
- **Lido Cloud**: future sync, account, portal, and multi-device layer. Not live.

Use short Italian labels inside dense UI where useful, for example `Studio`, `Booking`, `Clienti`, `Listino`, `Cassa`, or `Sistema`.

## Temporary Names

Avoid using these names as product names in new public-facing documentation:

- `beach-bdf`
- `Beach BDF`
- `Spiaggia BDF`

Allowed exceptions:

- historical delivery notes;
- internal migration references;
- local folder names during transition;
- seeded demo beach/layout names where the value is operational test data rather than product branding.

## Repository Name

Canonical public repository name:

```text
lido-pro
```

Acceptable alternatives if needed:

```text
lido-pro-app
lido-pro-platform
```

The local folder should also move to `lido-pro` when the workspace can be safely renamed outside an active editor/session.

## Logo Direction

The mermaid/sirena direction can be used as a visual homage or brand symbol.

Do not make `Sirena` the product name. Prefer an abstract mark: a mermaid silhouette, wave, fin, or coastal shape integrated with an `L`.

## Brand And Trademark Posture

LidoPro is a reserved commercial product name.

Lido Studio is the layout/design module name. Lido Booking, Lido Clienti, Lido Listino, Lido Pay, and Lido Cloud are reserved product/module names unless explicitly released for external use.

The siren/mermaid logo direction is part of the brand identity and visual homage. Brand assets, icons, wordmarks, screenshots, UI identity, product copy, and commercial positioning are reserved.

Repository visibility does not grant rights to use the LidoPro name, logo, siren/mermaid mark, icon, screenshots, UI identity, product copy, or confusingly similar derived branding.

## Brand Assets

Current PNG brand assets live in `public/brand`.

Canonical files:

- `lidopro-wordmark.png`: horizontal logo for README and wide surfaces.
- `lidopro-wordmark-transparent.png`: transparent/cropped horizontal logo for README, topbar, and app surfaces.
- `lidopro-logo-full.png`: stacked logo lockup.
- `lidopro-app-icon.png`: rounded app icon source.
- `lidopro-mark.png`: original simplified mark source.
- `lidopro-mark-transparent.png`: transparent simplified mark for compact UI.
- `favicon.png`: 64px transparent browser favicon generated from the simplified mark.
- `apple-touch-icon.png`: 180px touch icon generated from the transparent mark.
- `android-chrome-192x192.png`: 192px web app icon generated from the transparent mark.
- `android-chrome-512x512.png`: 512px web app icon generated from the transparent mark.
- `public/favicon.ico`: transparent legacy browser fallback generated from the transparent mark.

The current assets are PNG, not SVG. Use the transparent mark for favicons and compact UI. Wider lockups can stay on controlled brand surfaces with background, border radius, and object-fit rules so raster edges do not look accidental.

## Public Copy Guardrails

Use:

```text
LidoPro is proprietary commercial local-first beach management software currently under active development / pre-release.
```

Do not claim:

- open source status;
- free commercial use;
- public commercial release;
- online booking portal;
- live cloud sync;
- production payment processing;
- hosted customer accounts;
- ready-for-all-stabilimenti deployment.
