import type { SketchPoint } from './sketchCanvasState'

export interface SketchDimension {
  id: string
  label: string
  start: SketchPoint
  end: SketchPoint
  valueM: number
  temporary?: boolean
}

export const formatMeters = (value: number, precision = 1) =>
  `${value.toFixed(precision).replace('.', ',')} m`

export const distanceBetween = (start: SketchPoint, end: SketchPoint) =>
  Math.hypot(end.x - start.x, end.y - start.y)
