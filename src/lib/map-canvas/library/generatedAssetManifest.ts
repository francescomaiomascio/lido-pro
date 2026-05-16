import assetUrl0 from '../../../assets/beach-generated/umbrellas/umbrella_classic_top.png?url'
import previewUrl0 from '../../../assets/beach-generated/previews/umbrellas/umbrella_classic_top.png?url'
import assetUrl1 from '../../../assets/beach-generated/umbrellas/umbrella_striped_top.png?url'
import previewUrl1 from '../../../assets/beach-generated/previews/umbrellas/umbrella_striped_top.png?url'
import assetUrl2 from '../../../assets/beach-generated/umbrellas/umbrella_premium_top.png?url'
import previewUrl2 from '../../../assets/beach-generated/previews/umbrellas/umbrella_premium_top.png?url'
import assetUrl3 from '../../../assets/beach-generated/palms/palm_large_top.png?url'
import previewUrl3 from '../../../assets/beach-generated/previews/palms/palm_large_top.png?url'
import assetUrl4 from '../../../assets/beach-generated/palms/palm_medium_top.png?url'
import previewUrl4 from '../../../assets/beach-generated/previews/palms/palm_medium_top.png?url'
import assetUrl5 from '../../../assets/beach-generated/palms/palm_small_top.png?url'
import previewUrl5 from '../../../assets/beach-generated/previews/palms/palm_small_top.png?url'
import assetUrl6 from '../../../assets/beach-generated/furniture/sunbed_top.png?url'
import previewUrl6 from '../../../assets/beach-generated/previews/furniture/sunbed_top.png?url'
import assetUrl7 from '../../../assets/beach-generated/furniture/deck_chair_top.png?url'
import previewUrl7 from '../../../assets/beach-generated/previews/furniture/deck_chair_top.png?url'
import assetUrl8 from '../../../assets/beach-generated/furniture/chair_top.png?url'
import previewUrl8 from '../../../assets/beach-generated/previews/furniture/chair_top.png?url'
import assetUrl9 from '../../../assets/beach-generated/furniture/table_top.png?url'
import previewUrl9 from '../../../assets/beach-generated/previews/furniture/table_top.png?url'
import assetUrl10 from '../../../assets/beach-generated/walkways/walkway_wood_tile.png?url'
import previewUrl10 from '../../../assets/beach-generated/previews/walkways/walkway_wood_tile.png?url'
import assetUrl11 from '../../../assets/beach-generated/walkways/walkway_bamboo_tile.png?url'
import previewUrl11 from '../../../assets/beach-generated/previews/walkways/walkway_bamboo_tile.png?url'
import assetUrl12 from '../../../assets/beach-generated/walkways/walkway_modular_tile.png?url'
import previewUrl12 from '../../../assets/beach-generated/previews/walkways/walkway_modular_tile.png?url'

export type GeneratedBeachAssetFamily = 'umbrella' | 'palm' | 'furniture' | 'walkway'

export interface GeneratedBeachAsset {
  id: string
  family: GeneratedBeachAssetFamily
  label: string
  projection: 'top_down'
  file: string
  previewFile: string
  defaultWidthM: number
  defaultHeightM: number
  moduleLengthM?: number
  collisionShape: 'circle' | 'rect' | 'polygon'
  source: 'self_generated_blender_codex' | 'self_generated_codex_fallback_after_blender_crash'
  license: 'project_owned'
  requiresAttribution: boolean
  qualityStatus: 'approved'
  visualStyle: 'top_down'
  approvedForCanvas: boolean
  approvedForLibraryPreview: boolean
  palmScaleGroup?: 'large' | 'medium' | 'small'
  url: string
  previewUrl: string
}

export const generatedBeachAssets: GeneratedBeachAsset[] = [
  {
  id: 'umbrella_classic_top',
  family: 'umbrella',
  label: 'Ombrellone classico',
  projection: 'top_down',
  file: 'umbrellas/umbrella_classic_top.png',
  previewFile: 'previews/umbrellas/umbrella_classic_top.png',
  defaultWidthM: 1.4,
  defaultHeightM: 1.4,
  collisionShape: 'circle',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  url: assetUrl0,
  previewUrl: previewUrl0,
},
  {
  id: 'umbrella_striped_top',
  family: 'umbrella',
  label: 'Ombrellone rigato',
  projection: 'top_down',
  file: 'umbrellas/umbrella_striped_top.png',
  previewFile: 'previews/umbrellas/umbrella_striped_top.png',
  defaultWidthM: 1.4,
  defaultHeightM: 1.4,
  collisionShape: 'circle',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  url: assetUrl1,
  previewUrl: previewUrl1,
},
  {
  id: 'umbrella_premium_top',
  family: 'umbrella',
  label: 'Ombrellone premium',
  projection: 'top_down',
  file: 'umbrellas/umbrella_premium_top.png',
  previewFile: 'previews/umbrellas/umbrella_premium_top.png',
  defaultWidthM: 1.6,
  defaultHeightM: 1.6,
  collisionShape: 'circle',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  url: assetUrl2,
  previewUrl: previewUrl2,
},
  {
  id: 'palm_large_top',
  family: 'palm',
  label: 'Palma grande',
  projection: 'top_down',
  file: 'palms/palm_large_top.png',
  previewFile: 'previews/palms/palm_large_top.png',
  defaultWidthM: 1.35,
  defaultHeightM: 1.35,
  collisionShape: 'circle',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  palmScaleGroup: 'large',
  url: assetUrl3,
  previewUrl: previewUrl3,
},
  {
  id: 'palm_medium_top',
  family: 'palm',
  label: 'Palma media',
  projection: 'top_down',
  file: 'palms/palm_medium_top.png',
  previewFile: 'previews/palms/palm_medium_top.png',
  defaultWidthM: 1.15,
  defaultHeightM: 1.15,
  collisionShape: 'circle',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  palmScaleGroup: 'medium',
  url: assetUrl4,
  previewUrl: previewUrl4,
},
  {
  id: 'palm_small_top',
  family: 'palm',
  label: 'Palma piccola / palmetta',
  projection: 'top_down',
  file: 'palms/palm_small_top.png',
  previewFile: 'previews/palms/palm_small_top.png',
  defaultWidthM: 0.9,
  defaultHeightM: 0.9,
  collisionShape: 'circle',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  palmScaleGroup: 'small',
  url: assetUrl5,
  previewUrl: previewUrl5,
},
  {
  id: 'sunbed_top',
  family: 'furniture',
  label: 'Lettino top-down',
  projection: 'top_down',
  file: 'furniture/sunbed_top.png',
  previewFile: 'previews/furniture/sunbed_top.png',
  defaultWidthM: 0.8,
  defaultHeightM: 1.9,
  collisionShape: 'rect',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  url: assetUrl6,
  previewUrl: previewUrl6,
},
  {
  id: 'deck_chair_top',
  family: 'furniture',
  label: 'Sdraio top-down',
  projection: 'top_down',
  file: 'furniture/deck_chair_top.png',
  previewFile: 'previews/furniture/deck_chair_top.png',
  defaultWidthM: 0.7,
  defaultHeightM: 1.5,
  collisionShape: 'rect',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  url: assetUrl7,
  previewUrl: previewUrl7,
},
  {
  id: 'chair_top',
  family: 'furniture',
  label: 'Sedia top-down',
  projection: 'top_down',
  file: 'furniture/chair_top.png',
  previewFile: 'previews/furniture/chair_top.png',
  defaultWidthM: 0.55,
  defaultHeightM: 0.55,
  collisionShape: 'rect',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  url: assetUrl8,
  previewUrl: previewUrl8,
},
  {
  id: 'table_top',
  family: 'furniture',
  label: 'Tavolino top-down',
  projection: 'top_down',
  file: 'furniture/table_top.png',
  previewFile: 'previews/furniture/table_top.png',
  defaultWidthM: 0.7,
  defaultHeightM: 0.7,
  collisionShape: 'circle',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  url: assetUrl9,
  previewUrl: previewUrl9,
},
  {
  id: 'walkway_wood_tile',
  family: 'walkway',
  label: 'Passerella legno',
  projection: 'top_down',
  file: 'walkways/walkway_wood_tile.png',
  previewFile: 'previews/walkways/walkway_wood_tile.png',
  defaultWidthM: 1.2,
  defaultHeightM: 2.0,
  collisionShape: 'rect',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  moduleLengthM: 2.0,
  url: assetUrl10,
  previewUrl: previewUrl10,
},
  {
  id: 'walkway_bamboo_tile',
  family: 'walkway',
  label: 'Passerella bamboo',
  projection: 'top_down',
  file: 'walkways/walkway_bamboo_tile.png',
  previewFile: 'previews/walkways/walkway_bamboo_tile.png',
  defaultWidthM: 1.1,
  defaultHeightM: 1.8,
  collisionShape: 'rect',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  moduleLengthM: 1.8,
  url: assetUrl11,
  previewUrl: previewUrl11,
},
  {
  id: 'walkway_modular_tile',
  family: 'walkway',
  label: 'Pedana modulare',
  projection: 'top_down',
  file: 'walkways/walkway_modular_tile.png',
  previewFile: 'previews/walkways/walkway_modular_tile.png',
  defaultWidthM: 1.2,
  defaultHeightM: 1.2,
  collisionShape: 'rect',
  source: 'self_generated_codex_fallback_after_blender_crash',
  license: 'project_owned',
  requiresAttribution: false,
  qualityStatus: 'approved',
  visualStyle: 'top_down',
  approvedForCanvas: false,
  approvedForLibraryPreview: true,
  moduleLengthM: 1.2,
  url: assetUrl12,
  previewUrl: previewUrl12,
}
]

export const approvedGeneratedBeachAssets = generatedBeachAssets.filter(
  (asset) => asset.qualityStatus === 'approved' && asset.approvedForLibraryPreview,
)

export function getGeneratedBeachAssets(family: GeneratedBeachAssetFamily): GeneratedBeachAsset[] {
  return approvedGeneratedBeachAssets.filter((asset) => asset.family === family)
}
