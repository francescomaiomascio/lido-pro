import type { CanvasCamera, CanvasMapElement } from '../types'
import type { MapAssetCodeDisplayMode, MapAssetRowLabelMode, MapCanvasConfig } from '../config'
import type { BeachCanvasAssetDefinition } from './assetDefinitions'

export interface BeachCanvasAssetRenderInput {
  context: CanvasRenderingContext2D
  element: CanvasMapElement
  definition: BeachCanvasAssetDefinition
  widthPx: number
  heightPx: number
  showLabel: boolean
  shadowsEnabled: boolean
  highContrastLabel: boolean
  codeDisplayMode: MapAssetCodeDisplayMode
  rowLabelMode: MapAssetRowLabelMode
}

export interface AssetScreenSize {
  widthPx: number
  heightPx: number
}

export function getAssetScreenSizePx(input: {
  element: CanvasMapElement
  definition: BeachCanvasAssetDefinition
  config: MapCanvasConfig
  pixelsPerMeter: number
  camera: CanvasCamera
}): AssetScreenSize {
  const widthPx =
    input.element.widthM *
    input.pixelsPerMeter *
    input.camera.zoom *
    input.config.assets.scale *
    input.definition.visualScale
  const heightPx =
    input.element.heightM *
    input.pixelsPerMeter *
    input.camera.zoom *
    input.config.assets.scale *
    input.definition.visualScale

  return {
    widthPx: clamp(widthPx, input.definition.minScreenSizePx, input.definition.maxScreenSizePx),
    heightPx: clamp(heightPx, input.definition.minScreenSizePx, input.definition.maxScreenSizePx),
  }
}

export function drawAssetGroundShadow(input: {
  context: CanvasRenderingContext2D
  widthPx: number
  heightPx: number
  fillStyle: string
  offsetYPx?: number
}): void {
  input.context.save()
  input.context.fillStyle = input.fillStyle
  input.context.beginPath()
  input.context.ellipse(
    0,
    input.offsetYPx ?? input.heightPx * 0.22,
    input.widthPx * 0.34,
    input.heightPx * 0.18,
    0,
    0,
    Math.PI * 2,
  )
  input.context.fill()
  input.context.restore()
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
