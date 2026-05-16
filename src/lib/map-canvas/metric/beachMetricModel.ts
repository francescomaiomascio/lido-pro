import type { SeaSide } from '../types'

export interface BeachRowMetricDefinition {
  id: string
  label: string
  family: 'palm' | 'umbrella' | 'small_palm'
  itemCount: number
  yM?: number
  minGapM?: number
  distributionMode: 'existing_locked' | 'uniform' | 'manual'
  locked: boolean
}

export interface BeachDistanceRules {
  minPalmGapM: number
  minUmbrellaGapM: number
  minSmallPalmGapM: number
  minMixedAssetGapM: number
  minPalmRowGapM: number
  minUmbrellaRowGapM: number
  minZoneGapM: number
  marginFromBoundaryM: number
  marginFromSeaM: number
  marginFromEntranceM: number
}

export interface BeachSurfaceZoneMetric {
  id: string
  label: string
  type: 'sea_visual' | 'palms' | 'umbrellas' | 'small_palms' | 'empty' | 'unusable' | 'service'
  geometry: 'rect' | 'polygon_future'
  xM: number
  yM: number
  widthM: number
  heightM: number
  locked: boolean
  visible: boolean
  allowedAssetFamilies: Array<'palm' | 'umbrella' | 'small_palm' | 'furniture' | 'map_item' | 'walkway'>
}

export interface BeachMetricModel {
  beach: {
    widthM: number
    depthM: number
    seaSide: SeaSide
    marginsM: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
  capacity: {
    totalItems: number
    palms: number
    umbrellas: number
    smallPalms: number
  }
  rows: BeachRowMetricDefinition[]
  distances: BeachDistanceRules
  zones: BeachSurfaceZoneMetric[]
}

export const defaultBeachRows: BeachRowMetricDefinition[] = [
  { id: 'P1', label: 'P1', family: 'palm', itemCount: 8, distributionMode: 'existing_locked', locked: true },
  { id: 'P2', label: 'P2', family: 'palm', itemCount: 9, distributionMode: 'existing_locked', locked: true },
  { id: 'P3', label: 'P3', family: 'palm', itemCount: 9, distributionMode: 'existing_locked', locked: true },
  { id: 'P4', label: 'P4', family: 'palm', itemCount: 8, distributionMode: 'existing_locked', locked: true },
  { id: 'O1', label: 'O1', family: 'umbrella', itemCount: 11, distributionMode: 'existing_locked', locked: true },
  { id: 'O2', label: 'O2', family: 'umbrella', itemCount: 10, distributionMode: 'existing_locked', locked: true },
  { id: 'PM', label: 'PM', family: 'small_palm', itemCount: 3, distributionMode: 'existing_locked', locked: true },
]

export const defaultBeachDistanceRules: BeachDistanceRules = {
  minPalmGapM: 1.8,
  minUmbrellaGapM: 1.6,
  minSmallPalmGapM: 1.2,
  minMixedAssetGapM: 1.4,
  minPalmRowGapM: 2.4,
  minUmbrellaRowGapM: 2.2,
  minZoneGapM: 1.5,
  marginFromBoundaryM: 0.5,
  marginFromSeaM: 0.8,
  marginFromEntranceM: 0.8,
}

export const defaultBeachSurfaceZones: BeachSurfaceZoneMetric[] = [
  { id: 'sea-visual', label: 'Zona mare / ingresso visuale', type: 'sea_visual', geometry: 'rect', xM: 0, yM: 0, widthM: 31, heightM: 3.2, locked: true, visible: true, allowedAssetFamilies: [] },
  { id: 'palms', label: 'Zona palme', type: 'palms', geometry: 'rect', xM: 0, yM: 3.2, widthM: 31, heightM: 12.8, locked: true, visible: true, allowedAssetFamilies: ['palm'] },
  { id: 'umbrellas', label: 'Zona ombrelloni', type: 'umbrellas', geometry: 'rect', xM: 0, yM: 16, widthM: 31, heightM: 7.8, locked: true, visible: true, allowedAssetFamilies: ['umbrella'] },
  { id: 'small-palms', label: 'Zona palme piccole / palmette', type: 'small_palms', geometry: 'rect', xM: 0, yM: 23.8, widthM: 31, heightM: 2.8, locked: true, visible: true, allowedAssetFamilies: ['small_palm'] },
  { id: 'empty', label: 'Zona vuota', type: 'empty', geometry: 'rect', xM: 0, yM: 26.6, widthM: 31, heightM: 1.4, locked: true, visible: false, allowedAssetFamilies: [] },
  { id: 'unusable', label: 'Zona non utilizzabile', type: 'unusable', geometry: 'polygon_future', xM: 0, yM: 0, widthM: 0, heightM: 0, locked: true, visible: false, allowedAssetFamilies: [] },
  { id: 'service', label: 'Zona servizio', type: 'service', geometry: 'polygon_future', xM: 0, yM: 0, widthM: 0, heightM: 0, locked: true, visible: false, allowedAssetFamilies: ['map_item'] },
]

export const createDefaultBeachMetricModel = (): BeachMetricModel => ({
  beach: {
    widthM: 31,
    depthM: 28,
    seaSide: 'top',
    marginsM: {
      top: 0.5,
      right: 0.5,
      bottom: 0.5,
      left: 0.5,
    },
  },
  capacity: {
    totalItems: 58,
    palms: 34,
    umbrellas: 21,
    smallPalms: 3,
  },
  rows: defaultBeachRows,
  distances: defaultBeachDistanceRules,
  zones: defaultBeachSurfaceZones,
})
