import type { SketchPoint } from './sketchCanvasState'

export interface SketchSnapPoint extends SketchPoint {
  id: string
  label: string
  kind: 'corner' | 'midpoint' | 'edge' | 'grid'
}

export interface SketchSnapResult {
  point: SketchPoint
  snap?: SketchSnapPoint
}

export const snapToGrid = (point: SketchPoint, stepM = 0.25): SketchSnapResult => ({
  point: {
    x: Math.round(point.x / stepM) * stepM,
    y: Math.round(point.y / stepM) * stepM,
  },
  snap: {
    id: 'grid',
    label: `${stepM}m grid`,
    kind: 'grid',
    x: Math.round(point.x / stepM) * stepM,
    y: Math.round(point.y / stepM) * stepM,
  },
})
