export type BeachMetricAssetFamily =
  | 'umbrella'
  | 'palm'
  | 'small_palm'
  | 'furniture'
  | 'map_item'
  | 'walkway'

export interface AssetMetricDefinition {
  assetId: string
  family: BeachMetricAssetFamily
  label: string
  defaultWidthM: number
  defaultHeightM: number
  defaultDiameterM?: number
  collisionShape: 'circle' | 'rect' | 'polygon'
  spacingClass: 'large_object' | 'medium_object' | 'small_object' | 'walkway' | 'service'
}

export const assetMetricDefinitions: AssetMetricDefinition[] = [
  {
    assetId: 'umbrella_classic_top',
    family: 'umbrella',
    label: 'Ombrellone classico',
    defaultWidthM: 1.4,
    defaultHeightM: 1.4,
    defaultDiameterM: 1.4,
    collisionShape: 'circle',
    spacingClass: 'medium_object',
  },
  {
    assetId: 'umbrella_premium_top',
    family: 'umbrella',
    label: 'Ombrellone premium',
    defaultWidthM: 1.6,
    defaultHeightM: 1.6,
    defaultDiameterM: 1.6,
    collisionShape: 'circle',
    spacingClass: 'large_object',
  },
  {
    assetId: 'palm_large_top',
    family: 'palm',
    label: 'Palma grande',
    defaultWidthM: 1.35,
    defaultHeightM: 1.35,
    defaultDiameterM: 1.35,
    collisionShape: 'circle',
    spacingClass: 'large_object',
  },
  {
    assetId: 'palm_medium_top',
    family: 'palm',
    label: 'Palma media',
    defaultWidthM: 1.15,
    defaultHeightM: 1.15,
    defaultDiameterM: 1.15,
    collisionShape: 'circle',
    spacingClass: 'medium_object',
  },
  {
    assetId: 'palm_small_top',
    family: 'small_palm',
    label: 'Palma piccola / palmetta',
    defaultWidthM: 0.9,
    defaultHeightM: 0.9,
    defaultDiameterM: 0.9,
    collisionShape: 'circle',
    spacingClass: 'small_object',
  },
  {
    assetId: 'sunbed_top',
    family: 'furniture',
    label: 'Lettino',
    defaultWidthM: 0.8,
    defaultHeightM: 1.9,
    collisionShape: 'rect',
    spacingClass: 'medium_object',
  },
  {
    assetId: 'deck_chair_top',
    family: 'furniture',
    label: 'Sdraio',
    defaultWidthM: 0.7,
    defaultHeightM: 1.5,
    collisionShape: 'rect',
    spacingClass: 'medium_object',
  },
  {
    assetId: 'chair_top',
    family: 'furniture',
    label: 'Sedia',
    defaultWidthM: 0.55,
    defaultHeightM: 0.55,
    collisionShape: 'rect',
    spacingClass: 'small_object',
  },
  {
    assetId: 'table_top',
    family: 'furniture',
    label: 'Tavolino',
    defaultWidthM: 0.7,
    defaultHeightM: 0.7,
    defaultDiameterM: 0.7,
    collisionShape: 'circle',
    spacingClass: 'small_object',
  },
  {
    assetId: 'walkway_wood_tile',
    family: 'walkway',
    label: 'Modulo passerella legno',
    defaultWidthM: 1.2,
    defaultHeightM: 1,
    collisionShape: 'rect',
    spacingClass: 'walkway',
  },
]

export function getAssetMetricDefinition(assetId: string): AssetMetricDefinition | null {
  return assetMetricDefinitions.find((definition) => definition.assetId === assetId) ?? null
}
