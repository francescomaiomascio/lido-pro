import type { CanvasCamera, MetricPoint } from './types'

export function metersToPixels(valueM: number, pixelsPerMeter: number): number {
  return valueM * pixelsPerMeter
}

export function pixelsToMeters(valuePx: number, pixelsPerMeter: number): number {
  if (pixelsPerMeter === 0) {
    return 0
  }

  return valuePx / pixelsPerMeter
}

export function worldToScreenPoint(input: {
  point: MetricPoint
  pixelsPerMeter: number
  camera: CanvasCamera
}): { xPx: number; yPx: number } {
  const scale = input.pixelsPerMeter * input.camera.zoom

  return {
    xPx: metersToPixels(input.point.xM, scale) + input.camera.panXPx,
    yPx: metersToPixels(input.point.yM, scale) + input.camera.panYPx,
  }
}

export function screenToWorldPoint(input: {
  xPx: number
  yPx: number
  pixelsPerMeter: number
  camera: CanvasCamera
}): MetricPoint {
  const scale = input.pixelsPerMeter * input.camera.zoom

  return {
    xM: pixelsToMeters(input.xPx - input.camera.panXPx, scale),
    yM: pixelsToMeters(input.yPx - input.camera.panYPx, scale),
  }
}
