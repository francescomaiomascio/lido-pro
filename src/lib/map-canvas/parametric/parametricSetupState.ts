import type { AssetMetricDefinition } from '../assets/assetMetricDefinitions'
import type { SeaSide } from '../types'
import type { BeachDistanceRules } from '../metric/beachMetricModel'
import type { BeachItemType } from '../../types/beach'

export type ParametricSetupStatus = 'active_view' | 'draft_editing' | 'draft_calculated'

export interface ParametricSetupZone {
  id: string
  label: string
  type: string
  xM: number
  yM: number
  widthM: number
  heightM: number
  locked: boolean
  visible: boolean
  allowedAssetFamilies: string[]
}

export interface ParametricSetupRow {
  id: string
  label: string
  family: BeachItemType
  zoneId: string
  itemCount: number
  yM: number | null
  minGapM: number | null
  distributionMode: 'imported_locked' | 'uniform' | 'manual_future'
  locked: boolean
  assetVariantId: string | null
  startMarginM: number
  endMarginM: number
  distributionAxis: 'x' | 'y'
}

export interface ParametricSetupAssetMetric extends AssetMetricDefinition {
  locked: boolean
}

export type ParametricSetupDistanceRules = BeachDistanceRules

export interface ParametricSetupState {
  layoutVersionId: string
  status: ParametricSetupStatus
  beach: {
    name: string
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
  zones: ParametricSetupZone[]
  rows: ParametricSetupRow[]
  assetMetrics: ParametricSetupAssetMetric[]
  distanceRules: ParametricSetupDistanceRules
}
