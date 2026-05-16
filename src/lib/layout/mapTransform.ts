import type { MapViewportState } from './mapViewportState'

export const clampZoom = (zoom: number, minZoom: number, maxZoom: number): number =>
  Math.min(maxZoom, Math.max(minZoom, zoom))

export const getMapTransform = ({ zoom, panX, panY }: MapViewportState): string =>
  `translate(${panX}px, ${panY}px) scale(${zoom})`
