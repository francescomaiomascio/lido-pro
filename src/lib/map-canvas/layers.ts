export type MapCanvasLayer =
  | 'background'
  | 'surface'
  | 'zones'
  | 'walkways'
  | 'grid'
  | 'assets'
  | 'selection'
  | 'validation'
  | 'debug'

export const MAP_CANVAS_LAYER_ORDER: MapCanvasLayer[] = [
  'background',
  'surface',
  'zones',
  'walkways',
  'grid',
  'assets',
  'selection',
  'validation',
  'debug',
]
