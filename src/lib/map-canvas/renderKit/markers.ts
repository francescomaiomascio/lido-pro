import type { CanvasMapElement } from '../types'
import { mapCanvasStyleTokens } from '../styleTokens'
import { drawRoundedRect } from './primitives'
import { applySoftShadow, clearShadow } from './shadows'
import { drawAssetCodeLabel } from './labels'

export function drawAssetMarker(input: {
  context: CanvasRenderingContext2D
  element: CanvasMapElement
  widthPx: number
  heightPx: number
  showLabel: boolean
  shadowsEnabled: boolean
  highContrastLabel: boolean
}): void {
  if (input.element.assetType === 'umbrella') {
    drawUmbrellaMarker(input)
    return
  }

  if (input.element.assetType === 'small_palm') {
    drawSmallPalmMarker(input)
    return
  }

  drawPalmMarker(input)
}

export function drawPalmMarker(input: Parameters<typeof drawAssetMarker>[0]): void {
  drawBaseMarker({ ...input, fillStyle: mapCanvasStyleTokens.colors.palm, lineWidth: 1.6 })
}

export function drawUmbrellaMarker(input: Parameters<typeof drawAssetMarker>[0]): void {
  drawBaseMarker({ ...input, fillStyle: mapCanvasStyleTokens.colors.umbrella, lineWidth: 2 })
}

export function drawSmallPalmMarker(input: Parameters<typeof drawAssetMarker>[0]): void {
  drawBaseMarker({ ...input, fillStyle: mapCanvasStyleTokens.colors.smallPalm, lineWidth: 1.6 })
}

function drawBaseMarker(input: Parameters<typeof drawAssetMarker>[0] & {
  fillStyle: string
  lineWidth: number
}): void {
  const radiusPx = Math.min(input.widthPx, input.heightPx) / 2

  if (input.shadowsEnabled) {
    applySoftShadow(input.context)
  }

  drawRoundedRect({
    context: input.context,
    xPx: -input.widthPx / 2,
    yPx: -input.heightPx / 2,
    widthPx: input.widthPx,
    heightPx: input.heightPx,
    radiusPx,
    fillStyle: input.fillStyle,
  })

  clearShadow(input.context)

  const highlight = input.context.createLinearGradient(0, -input.heightPx / 2, 0, input.heightPx / 2)
  highlight.addColorStop(0, 'rgb(255 255 255 / 0.24)')
  highlight.addColorStop(0.48, 'rgb(255 255 255 / 0.04)')
  highlight.addColorStop(1, 'rgb(0 0 0 / 0.12)')
  drawRoundedRect({
    context: input.context,
    xPx: -input.widthPx / 2,
    yPx: -input.heightPx / 2,
    widthPx: input.widthPx,
    heightPx: input.heightPx,
    radiusPx,
    fillStyle: highlight,
    strokeStyle: mapCanvasStyleTokens.border.assetLight,
    lineWidth: input.lineWidth,
  })

  if (input.showLabel) {
    drawAssetCodeLabel({
      context: input.context,
      code: input.element.code,
      widthPx: input.widthPx,
      highContrast: input.highContrastLabel,
    })
  }
}
