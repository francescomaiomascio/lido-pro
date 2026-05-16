import type { BeachCanvasAssetRenderInput } from './assetStyle'
import { drawGeneratedSpriteAsset } from './generatedSpriteRenderer'
import { drawPalmAsset } from './palmRenderer'
import { drawSmallPalmAsset } from './smallPalmRenderer'
import { drawUmbrellaAsset } from './umbrellaRenderer'

export function drawBeachCanvasAssetWithBridge(input: BeachCanvasAssetRenderInput): void {
  if (drawGeneratedSpriteAsset(input)) {
    return
  }

  if (input.definition.kind === 'umbrella') {
    drawUmbrellaAsset(input)
    return
  }

  if (input.definition.kind === 'small_palm') {
    drawSmallPalmAsset(input)
    return
  }

  drawPalmAsset(input)
}
