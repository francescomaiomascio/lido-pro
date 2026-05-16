# Wave 3.1 - Viewport Fit + Minimal Visual Pass

## Purpose

Wave 3.1 makes the main Beach BDF workflow fit inside one viewport. The goal is to make the map visible immediately on tablet/desktop landscape without page-level vertical scrolling.

## Problems Addressed

- Topbar, summary, filters, map header, and map combined into a page that was too tall.
- The map scaled by width only, making it too high.
- Right detail panel could force page scrolling.
- List and menu needed internal scrolling rather than page scrolling.
- Map labels and tiles were too visually heavy for fit-to-screen use.

## Viewport Strategy

- `html`, `body`, and `#app` use full height.
- `body` uses `overflow: hidden`.
- `.app-shell` uses `height: 100dvh`.
- Shell rows are: compact topbar, compact command strip, flexible workspace.
- Workspace, map, list, detail, and menu containers use internal overflow where needed.

## Map Fit Strategy

The map keeps meters as source of truth and renders pixels only at display time.

`BeachMap.svelte` measures the available map viewport with `ResizeObserver` and uses:

```txt
scale = min(containerWidth / 31, containerHeight / 28)
renderedWidth = 31 * scale
renderedHeight = 28 * scale
```

This logic lives in `src/lib/layout/fitMapViewport.ts`.

## Shell And Topbar Compaction

- Topbar is now a compact one-row grid.
- App name, view switcher, search, and menu share one row.
- Summary and filters were moved into one command strip.
- Chips are shorter and less padded.

## Detail Panel Compaction

- Right panel height follows the workspace.
- Panel scrolls internally.
- Note textarea, field rows, buttons, and history are more compact.
- Technical details remain collapsed by default.

## Menu Compaction

- Menu sheet is constrained to `100dvh`.
- Menu content scrolls internally.
- Info spiaggia remains user-facing.
- Diagnostica remains technical and secondary.

## Phone Behavior

- Body remains non-scrolling.
- Command chips can scroll horizontally.
- Detail remains a bottom drawer.
- List and menu use internal scroll.

## Validation Results

```sh
pwd
node -v
npm -v
npm run check
npm run build
npm run cap:sync
npx cap sync android
curl -I http://localhost:5173/
```

Results:

- `npm run check`: passed with 0 errors and 0 warnings.
- `npm run build`: passed.
- `npm run cap:sync`: passed.
- direct `npx cap sync android`: passed.
- dev server responded with HTTP 200.

## Non-Goals

- No customers.
- No accounts.
- No payments.
- No reservations.
- No layout drag/edit.
- No backup/export/import.
- No login.
- No cloud services.
- No database schema change in this wave.

## Next Wave Recommendation

WAVE 4 - Customer Assignment Foundation.
