import type { BeachLayout } from '../types/beach'
import { BEACH_DEPTH_M, BEACH_WIDTH_M, DEFAULT_LAYOUT_ID, createInitialMetricBeachItems } from '../layout/metricBeachLayout'

export const INITIAL_SEED_VERSION = 1

export const defaultBeachLayout: BeachLayout = {
  id: DEFAULT_LAYOUT_ID,
  name: 'Lido Demo',
  widthM: BEACH_WIDTH_M,
  depthM: BEACH_DEPTH_M,
  isActive: true,
}

export const initialLayoutVersion = {
  id: 'default-layout-v1',
  layoutId: DEFAULT_LAYOUT_ID,
  version: 1,
  description: 'Initial metric seed layout, 31m x 28m',
} as const

export const createInitialBeachSeed = () => createInitialMetricBeachItems()
