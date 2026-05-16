# Metric Layout Model

## Meters Are Source Of Truth

Beach layout data is stored in real-world meters. This keeps the layout independent from tablet size, phone size, orientation, zoom, and future rendering changes.

## Pixels Are Rendering-Only

The UI converts `xM`, `yM`, `widthM`, and `heightM` to percentages or pixels at render time. Pixel values must not become the persisted source of truth.

## Beach Dimensions

The current beach model is 31m wide and 28m deep.

## Coordinate Convention

- `xM`: horizontal position in meters from the left edge.
- `yM`: vertical position in meters from the top edge.
- `widthM`: indicative physical footprint width.
- `heightM`: indicative physical footprint height.
- `rotationDeg`: future rotation support in degrees.

## Item Size Convention

Current seed sizes are approximate:

- Palm: 1.2m x 1.2m.
- Umbrella: 1.4m x 1.4m.
- Small palm: 1.0m x 1.0m.

## Future Layout Editing Model

A future editor should write changed positions back as meters. Dragging can happen in pixels, but save operations must convert the final point into metric coordinates.

## Future Exact-Measurement Update Model

When exact measurements arrive, update the metric seed or migration data. The rendering layer should not need architectural changes because it already consumes meters.
