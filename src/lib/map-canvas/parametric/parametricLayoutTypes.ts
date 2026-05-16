import type { BeachItemType } from '../../types/beach'

export type ParametricLayoutStatus = 'active' | 'draft' | 'archived'
export type ParametricLayoutSource = 'imported_legacy' | 'parametric_engine' | 'manual_future'
export type ParametricLayoutFamily = BeachItemType | 'furniture' | 'map_item'

export interface BeachLayoutVersion {
  id: string
  name: string
  status: ParametricLayoutStatus
  source: ParametricLayoutSource
  beachWidthM: number
  beachDepthM: number
  seaSide: 'top' | 'right' | 'bottom' | 'left'
  createdAt: string
  updatedAt: string
  activatedAt: string | null
}

export interface BeachLayoutElement {
  id: string
  layoutVersionId: string
  legacyBeachItemId: string | null
  code: string
  family: ParametricLayoutFamily
  rowLabel: string | null
  numberIndex: number | null
  xM: number
  yM: number
  widthM: number
  heightM: number
  diameterM: number | null
  rotationDeg: number
  zoneId: string | null
  locked: boolean
  active: boolean
  zIndex: number
}

export interface BeachLayoutRowDefinition {
  id: string
  layoutVersionId: string
  rowLabel: string
  family: BeachItemType
  itemCount: number
  yM: number | null
  minGapM: number | null
  distributionMode: 'imported_locked' | 'uniform' | 'manual_future'
  locked: boolean
}

export interface BeachLayoutZoneDefinition {
  id: string
  layoutVersionId: string
  type: string
  label: string
  xM: number
  yM: number
  widthM: number
  heightM: number
  locked: boolean
  visible: boolean
}

export interface BeachLayoutDistanceRulesDefinition {
  id: string
  layoutVersionId: string
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

export interface ParametricLayoutBundle {
  version: BeachLayoutVersion
  elements: BeachLayoutElement[]
  rows: BeachLayoutRowDefinition[]
  zones: BeachLayoutZoneDefinition[]
  distanceRules: BeachLayoutDistanceRulesDefinition | null
}
