import { createCanvasGridLines } from './grid'
import { worldToScreenPoint } from './metric'
import type { MapCanvasConfig } from './config'
import type { CanvasBeachSettings, CanvasCamera } from './types'
import { drawLine } from './renderKit'
import { getMapBackgroundPalette } from './visualPresets'

export function renderCanvasGrid(input: {
  context: CanvasRenderingContext2D
  settings: CanvasBeachSettings
  config: MapCanvasConfig
  pixelsPerMeter: number
  camera: CanvasCamera
}): void {
  const { context, settings, config, pixelsPerMeter, camera } = input

  if (!config.grid.visible) {
    return
  }

  const lines = createCanvasGridLines({
    widthM: settings.widthM,
    depthM: settings.depthM,
    stepM: config.grid.stepM,
    majorEveryM: config.grid.majorEveryM,
  })
  const zoomWeight = Math.max(0.45, Math.min(1, camera.zoom))
  const editMode = config.interaction.mode === 'edit'
  const palette = getMapBackgroundPalette(config.background.preset)
  const stepPx = config.grid.stepM * pixelsPerMeter * camera.zoom

  context.save()

  for (const line of lines) {
    if ((line.major && !config.grid.showMajorLines) || (!line.major && !config.grid.showMinorLines)) {
      continue
    }

    if (!line.major && stepPx < (editMode ? 10 : 18)) {
      continue
    }

    const from = worldToScreenPoint({ point: line.from, pixelsPerMeter, camera })
    const to = worldToScreenPoint({ point: line.to, pixelsPerMeter, camera })
    const baseAlpha = line.major
      ? (editMode ? 0.62 : 0.2)
      : (editMode ? 0.32 : 0.08)
    const alpha = Math.min(editMode ? 0.72 : 0.28, config.grid.opacity * zoomWeight * baseAlpha)

    context.globalAlpha = alpha
    drawLine({
      context,
      fromXPx: from.xPx,
      fromYPx: from.yPx,
      toXPx: to.xPx,
      toYPx: to.yPx,
      strokeStyle: line.major ? palette.gridMajor : palette.gridMinor,
      lineWidth: line.major ? (editMode ? 1 : 0.7) : (editMode ? 0.65 : 0.45),
    })
  }

  context.restore()
}
