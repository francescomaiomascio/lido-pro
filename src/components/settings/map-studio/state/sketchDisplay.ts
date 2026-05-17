export type SketchDisplayId =
  | 'grid'
  | 'dimensions'
  | 'constraints'
  | 'guides'
  | 'areas'
  | 'tracks'
  | 'footprints'
  | 'warnings'
  | 'preview'

export type SketchDisplayState = Record<SketchDisplayId, boolean>

export const createDefaultSketchDisplayState = (): SketchDisplayState => ({
  grid: true,
  dimensions: true,
  constraints: false,
  guides: true,
  areas: true,
  tracks: true,
  footprints: true,
  warnings: false,
  preview: false,
})
