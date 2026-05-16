import type { CanvasCamera } from './types'

export const CANVAS_CAMERA_MIN_ZOOM = 0.5
export const CANVAS_CAMERA_MAX_ZOOM = 4

export function getFitPixelsPerMeter(input: {
  beachWidthM: number
  beachDepthM: number
  viewportWidthPx: number
  viewportHeightPx: number
  paddingPx: number
}): number {
  const availableWidthPx = input.viewportWidthPx - input.paddingPx * 2
  const availableHeightPx = input.viewportHeightPx - input.paddingPx * 2

  if (
    input.beachWidthM <= 0 ||
    input.beachDepthM <= 0 ||
    availableWidthPx <= 0 ||
    availableHeightPx <= 0
  ) {
    return 0
  }

  return Math.min(availableWidthPx / input.beachWidthM, availableHeightPx / input.beachDepthM)
}

export function createDefaultCanvasCamera(devicePixelRatio = 1): CanvasCamera {
  return {
    zoom: 1,
    panXPx: 0,
    panYPx: 0,
    devicePixelRatio,
  }
}

export function clampZoom(zoom: number): number {
  return Math.min(CANVAS_CAMERA_MAX_ZOOM, Math.max(CANVAS_CAMERA_MIN_ZOOM, zoom))
}

export function zoomCamera(input: {
  camera: CanvasCamera
  zoomDelta: number
}): CanvasCamera {
  return {
    ...input.camera,
    zoom: clampZoom(input.camera.zoom + input.zoomDelta),
  }
}

export function panCamera(input: {
  camera: CanvasCamera
  deltaXPx: number
  deltaYPx: number
}): CanvasCamera {
  return {
    ...input.camera,
    panXPx: input.camera.panXPx + input.deltaXPx,
    panYPx: input.camera.panYPx + input.deltaYPx,
  }
}
