import type { CanvasAssetType } from '../types'

export type GeneratedCanvasSpriteId =
  | 'umbrella_classic_top'
  | 'palm_large_top'
  | 'palm_medium_top'
  | 'palm_small_top'

export function getDefaultGeneratedSpriteId(assetType: CanvasAssetType): GeneratedCanvasSpriteId | null {
  if (assetType === 'umbrella') {
    return 'umbrella_classic_top'
  }

  if (assetType === 'palm') {
    return 'palm_large_top'
  }

  if (assetType === 'medium_palm') {
    return 'palm_medium_top'
  }

  if (assetType === 'small_palm') {
    return 'palm_small_top'
  }

  return null
}
