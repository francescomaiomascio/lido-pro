import type { CanvasAssetType } from '../types'

export type BeachCanvasAssetKind = 'palm' | 'umbrella' | 'small_palm'

export interface BeachCanvasAssetDefinition {
  kind: BeachCanvasAssetKind
  label: string
  defaultWidthM: number
  defaultHeightM: number
  collisionShape: 'circle' | 'rect'
  visualScale: number
  minScreenSizePx: number
  maxScreenSizePx: number
}

export const beachCanvasAssetDefinitions: Record<BeachCanvasAssetKind, BeachCanvasAssetDefinition> = {
  palm: {
    kind: 'palm',
    label: 'Palma',
    defaultWidthM: 1.2,
    defaultHeightM: 1.2,
    collisionShape: 'circle',
    visualScale: 1,
    minScreenSizePx: 30,
    maxScreenSizePx: 78,
  },
  umbrella: {
    kind: 'umbrella',
    label: 'Ombrellone',
    defaultWidthM: 1.4,
    defaultHeightM: 1.4,
    collisionShape: 'circle',
    visualScale: 1,
    minScreenSizePx: 32,
    maxScreenSizePx: 82,
  },
  small_palm: {
    kind: 'small_palm',
    label: 'Palmetta',
    defaultWidthM: 1,
    defaultHeightM: 1,
    collisionShape: 'circle',
    visualScale: 0.96,
    minScreenSizePx: 28,
    maxScreenSizePx: 64,
  },
}

export function resolveBeachCanvasAssetKind(assetType: CanvasAssetType): BeachCanvasAssetKind | null {
  if (assetType === 'palm' || assetType === 'medium_palm') {
    return 'palm'
  }

  if (assetType === 'umbrella') {
    return 'umbrella'
  }

  if (assetType === 'small_palm') {
    return 'small_palm'
  }

  return null
}

export function getBeachCanvasAssetDefinition(
  assetType: CanvasAssetType,
): BeachCanvasAssetDefinition | null {
  const kind = resolveBeachCanvasAssetKind(assetType)
  return kind ? beachCanvasAssetDefinitions[kind] : null
}
