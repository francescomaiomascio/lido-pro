import type { CanvasBeachSettings, CanvasCamera } from './types'
import { createDefaultCanvasCamera } from './camera'

export const BDF_CANVAS_BEACH_WIDTH_M = 31
export const BDF_CANVAS_BEACH_DEPTH_M = 28
export const BDF_CANVAS_GRID_STEP_M = 1
export const BDF_CANVAS_SNAP_STEP_M = 0.5

export const bdfDefaultCanvasBeachSettings: CanvasBeachSettings = {
  widthM: BDF_CANVAS_BEACH_WIDTH_M,
  depthM: BDF_CANVAS_BEACH_DEPTH_M,
  unit: 'm',
  seaSide: 'top',
  margins: {
    leftM: 0,
    rightM: 0,
    topM: 0,
    bottomM: 0,
  },
  gridStepM: BDF_CANVAS_GRID_STEP_M,
  snapStepM: BDF_CANVAS_SNAP_STEP_M,
}

export const bdfDefaultCanvasCamera: CanvasCamera = createDefaultCanvasCamera()
