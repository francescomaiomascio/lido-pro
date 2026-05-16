import type { BeachCanvasAssetRenderInput } from './assetStyle'
import { drawBeachCanvasAssetWithBridge } from './assetRendererBridge'

export function drawBeachCanvasAsset(input: BeachCanvasAssetRenderInput): void {
  drawBeachCanvasAssetWithBridge(input)
}
