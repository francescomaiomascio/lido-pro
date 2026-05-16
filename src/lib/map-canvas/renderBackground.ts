import { worldToScreenPoint } from './metric'
import type { MapCanvasConfig } from './config'
import type { CanvasBeachSettings, CanvasCamera } from './types'
import {
  drawBeachBoundaryGuide,
  drawGradientSurface,
  drawNoiseTexture,
  drawSubtleSurfaceDepth,
  drawSubtleVignette,
} from './renderKit'
import { mapCanvasStyleTokens } from './styleTokens'
import { getMapBackgroundPalette } from './visualPresets'

export function renderCanvasBackground(input: {
  context: CanvasRenderingContext2D
  settings: CanvasBeachSettings
  config: MapCanvasConfig
  pixelsPerMeter: number
  camera: CanvasCamera
}): void {
  const { context, settings, config, pixelsPerMeter, camera } = input
  const topLeft = worldToScreenPoint({
    point: { xM: 0, yM: 0 },
    pixelsPerMeter,
    camera,
  })
  const bottomRight = worldToScreenPoint({
    point: { xM: settings.widthM, yM: settings.depthM },
    pixelsPerMeter,
    camera,
  })
  const widthPx = bottomRight.xPx - topLeft.xPx
  const heightPx = bottomRight.yPx - topLeft.yPx
  const viewportWidthPx = context.canvas.clientWidth || context.canvas.width / camera.devicePixelRatio
  const viewportHeightPx = context.canvas.clientHeight || context.canvas.height / camera.devicePixelRatio

  context.save()

  drawGradientSurface({
    context,
    xPx: 0,
    yPx: 0,
    widthPx: viewportWidthPx,
    heightPx: viewportHeightPx,
    config,
  })

  if (config.background.textureEnabled) {
    drawNoiseTexture({
      context,
      xPx: 0,
      yPx: 0,
      widthPx: viewportWidthPx,
      heightPx: viewportHeightPx,
      intensity: config.background.textureIntensity,
      config,
    })
  }

  if (config.background.vignetteEnabled) {
    drawSubtleVignette({
      context,
      xPx: 0,
      yPx: 0,
      widthPx: viewportWidthPx,
      heightPx: viewportHeightPx,
      config,
    })
  }

  drawSubtleSurfaceDepth({
    context,
    xPx: topLeft.xPx,
    yPx: topLeft.yPx,
    widthPx,
    heightPx,
    config,
  })

  drawBeachBoundaryGuide({
    context,
    xPx: topLeft.xPx,
    yPx: topLeft.yPx,
    widthPx,
    heightPx,
    editMode: config.interaction.mode === 'edit',
    config,
  })

  renderBeachMargins({
    context,
    settings,
    config,
    pixelsPerMeter,
    camera,
  })

  context.restore()
}

function renderBeachMargins(input: {
  context: CanvasRenderingContext2D
  settings: CanvasBeachSettings
  config: MapCanvasConfig
  pixelsPerMeter: number
  camera: CanvasCamera
}): void {
  const { context, settings, config, pixelsPerMeter, camera } = input
  const { leftM, rightM, topM, bottomM } = config.beach.margins
  const hasMargins = leftM > 0 || rightM > 0 || topM > 0 || bottomM > 0

  if (config.interaction.mode !== 'edit' || !hasMargins) {
    return
  }

  const topLeft = worldToScreenPoint({
    point: { xM: leftM, yM: topM },
    pixelsPerMeter,
    camera,
  })
  const bottomRight = worldToScreenPoint({
    point: {
      xM: Math.max(leftM, settings.widthM - rightM),
      yM: Math.max(topM, settings.depthM - bottomM),
    },
    pixelsPerMeter,
    camera,
  })
  const widthPx = bottomRight.xPx - topLeft.xPx
  const heightPx = bottomRight.yPx - topLeft.yPx

  context.save()
  context.shadowColor = 'transparent'
  context.setLineDash(config.interaction.mode === 'edit' ? [7, 5] : [])
  const palette = getMapBackgroundPalette(config.background.preset)
  context.strokeStyle = config.interaction.mode === 'edit'
    ? 'rgb(241 191 56 / 0.82)'
    : (palette.boundaryWork ?? mapCanvasStyleTokens.border.technical)
  context.lineWidth = config.interaction.mode === 'edit' ? 1.25 : 0.65
  context.strokeRect(topLeft.xPx + 0.5, topLeft.yPx + 0.5, widthPx - 1, heightPx - 1)
  context.restore()
}
