import { worldToScreenPoint } from './metric'
import type { MapCanvasConfig } from './config'
import type { CanvasCamera, CanvasMapElement } from './types'
import { drawSelectionRing, drawSmallBadge } from './renderKit'
import { getBeachCanvasAssetDefinition } from './assets/assetDefinitions'
import { getAssetScreenSizePx } from './assets/assetStyle'
import {
  getGeneratedSpriteProfileForAssetType,
} from './assets/generatedSpriteRenderer'
import { getProfiledGeneratedAssetSize } from './assets/generatedAssetRenderProfiles'

export function renderCanvasSelection(input: {
  context: CanvasRenderingContext2D
  selectedElement: CanvasMapElement | null
  config: MapCanvasConfig
  pixelsPerMeter: number
  camera: CanvasCamera
}): void {
  const { context, selectedElement, config, pixelsPerMeter, camera } = input

  if (!selectedElement || !config.assets.selectedRingEnabled) {
    return
  }

  const center = worldToScreenPoint({
    point: { xM: selectedElement.xM, yM: selectedElement.yM },
    pixelsPerMeter,
    camera,
  })
  const definition = getBeachCanvasAssetDefinition(selectedElement.assetType)

  if (!definition) {
    return
  }

  const assetSize = getAssetScreenSizePx({
    element: selectedElement,
    definition,
    config,
    pixelsPerMeter,
    camera,
  })
  const { profile } = getGeneratedSpriteProfileForAssetType(selectedElement.assetType)
  const visualSize = getProfiledGeneratedAssetSize({
    widthPx: assetSize.widthPx,
    heightPx: assetSize.heightPx,
    profile,
  })
  const widthPx = visualSize.widthPx * profile.ringScale + 7
  const heightPx = visualSize.heightPx * profile.ringScale + 7

  context.save()
  context.translate(center.xPx, center.yPx)
  context.rotate((selectedElement.rotationDeg * Math.PI) / 180)
  drawSelectionRing({
    context,
    widthPx,
    heightPx,
    editMode: config.interaction.mode === 'edit',
  })
  drawSmallBadge({
    context,
    text: '',
    xPx: widthPx / 2 - 3,
    yPx: -heightPx / 2 + 3,
  })

  context.restore()
}
