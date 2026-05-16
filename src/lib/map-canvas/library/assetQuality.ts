export type AssetQualityStatus = 'approved' | 'quarantined' | 'rejected' | 'planned'

export type AssetVisualStyle =
  | 'top_down'
  | 'isometric_light'
  | 'technical_icon'
  | 'flat_icon'
  | 'mixed_unknown'

export interface AssetQualityReview {
  assetId: string
  status: AssetQualityStatus
  visualStyle: AssetVisualStyle
  reason?: string
  approvedForCanvas: boolean
  approvedForLibraryPreview: boolean
}

export const assetQualityGateRules = [
  'Coerente con vista dall’alto o semi-3D leggero.',
  'Non cartoon, non emoji-like, non icona web generica.',
  'Licenza chiara e tracciata.',
  'Stile compatibile con gli altri asset approvati.',
  'Silhouette leggibile a dimensioni piccole su tablet.',
  'Categoria corretta: palmette sono varianti piccole dentro Palme.',
]

export const isAssetApprovedForMainLibrary = (review: AssetQualityReview): boolean =>
  review.status === 'approved' && review.approvedForLibraryPreview

export const isAssetApprovedForCanvasRenderer = (review: AssetQualityReview): boolean =>
  review.status === 'approved' && review.approvedForCanvas
