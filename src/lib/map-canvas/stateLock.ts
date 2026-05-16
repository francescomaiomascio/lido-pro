export const MAP_CANVAS_STATE_LOCK_VERSION = 'MAP.R4'

export const BDF_LOCKED_LAYOUT_COUNTS = {
  total: 58,
  palms: {
    P1: 8,
    P2: 9,
    P3: 9,
    P4: 8,
  },
  umbrellas: {
    O1: 11,
    O2: 10,
  },
  smallPalms: {
    PM: 3,
  },
} as const

export const BDF_LOCKED_BEACH_SIZE_M = {
  widthM: 31,
  depthM: 28,
} as const

export const MAP_CANVAS_LOCKED_PRESERVATION_RULES = [
  'Do not modify beach_items before layout versioning.',
  'Do not regenerate the current 58-item layout.',
  'Do not reset the local database.',
  'Do not persist draft coordinate edits before layout versioning.',
  'Do not mix customer/account workflows into the map-canvas engine.',
] as const
