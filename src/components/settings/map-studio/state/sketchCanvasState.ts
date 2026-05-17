export interface SketchPoint {
  x: number
  y: number
}

export interface SketchViewportState {
  scale: number
  panX: number
  panY: number
  minZoom: number
  maxZoom: number
  fitMode: boolean
}

export interface SketchViewportRect {
  width: number
  height: number
}

export const createSketchViewportState = (): SketchViewportState => ({
  scale: 22,
  panX: 180,
  panY: 110,
  minZoom: 7,
  maxZoom: 72,
  fitMode: true,
})

export const clampSketchZoom = (viewport: SketchViewportState, scale: number) =>
  Math.min(viewport.maxZoom, Math.max(viewport.minZoom, scale))

export const worldToScreen = (point: SketchPoint, viewport: SketchViewportState): SketchPoint => ({
  x: point.x * viewport.scale + viewport.panX,
  y: point.y * viewport.scale + viewport.panY,
})

export const screenToWorld = (point: SketchPoint, viewport: SketchViewportState): SketchPoint => ({
  x: (point.x - viewport.panX) / viewport.scale,
  y: (point.y - viewport.panY) / viewport.scale,
})

export const fitSketchViewport = (
  rect: SketchViewportRect,
  modelSize: { widthM: number; depthM: number },
): SketchViewportState => {
  const safeWidth = Math.max(1, rect.width)
  const safeHeight = Math.max(1, rect.height)
  const isCompact = safeWidth < 900
  const isPhone = safeWidth < 620
  const availableWidth = Math.max(220, safeWidth - (isPhone ? 92 : isCompact ? 126 : 260))
  const availableHeight = Math.max(180, safeHeight - (isPhone ? 430 : isCompact ? 360 : 230))
  const scale = Math.min(40, Math.max(8, Math.min(availableWidth / modelSize.widthM, availableHeight / modelSize.depthM)))
  const centeredY = (safeHeight - modelSize.depthM * scale) / 2
  return {
    scale,
    panX: (safeWidth - modelSize.widthM * scale) / 2,
    panY: isCompact ? Math.max(118, Math.min(centeredY, 168)) : Math.max(82, centeredY),
    minZoom: 7,
    maxZoom: 72,
    fitMode: true,
  }
}

export const zoomSketchViewportAt = (
  viewport: SketchViewportState,
  screenPoint: SketchPoint,
  deltaScale: number,
): SketchViewportState => {
  const nextScale = clampSketchZoom(viewport, viewport.scale * deltaScale)
  const world = screenToWorld(screenPoint, viewport)
  return {
    ...viewport,
    scale: nextScale,
    panX: screenPoint.x - world.x * nextScale,
    panY: screenPoint.y - world.y * nextScale,
    fitMode: false,
  }
}
