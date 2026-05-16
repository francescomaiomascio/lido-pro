import { bdfDefaultCanvasBeachSettings } from './defaults'
import type { CanvasBeachSettings } from './types'

export interface MapCanvasConfig {
  beach: CanvasBeachSettings
  grid: MapGridConfig
  background: MapBackgroundConfig
  assets: MapAssetRenderConfig
  zones: MapZoneRenderConfig
  interaction: MapInteractionConfig
  rules: MapLayoutRulesConfig
  walkways: MapWalkwayConfig
}

export interface MapGridConfig {
  visible: boolean
  stepM: number
  majorEveryM: number
  opacity: number
  showMajorLines: boolean
  showMinorLines: boolean
}

export type MapBackgroundPreset =
  | 'warm_sand'
  | 'soft_aqua'
  | 'neutral'
  | 'muted_dark'
  | 'clean_light'

export interface MapBackgroundConfig {
  preset: MapBackgroundPreset
  textureEnabled: boolean
  textureIntensity: number
  seaGradientEnabled: boolean
  vignetteEnabled: boolean
}

export type MapLabelMode = 'always' | 'selected' | 'hidden'
export type MapAssetCodeDisplayMode = 'stored_code' | 'sequential_by_family'
export type MapAssetRowLabelMode = 'inline' | 'side_badge' | 'hidden'
export type MapAssetRowLabelNumberingMode = 'global' | 'by_family'

export interface MapAssetRenderConfig {
  scale: number
  labelMode: MapLabelMode
  codeDisplayMode: MapAssetCodeDisplayMode
  rowLabelMode: MapAssetRowLabelMode
  rowLabelNumberingMode: MapAssetRowLabelNumberingMode
  rowLabelOverrides: Record<string, string>
  shadowsEnabled: boolean
  highContrastLabels: boolean
  selectedRingEnabled: boolean
}

export interface MapZoneRenderConfig {
  visible: boolean
  opacity: number
  showLabels: boolean
}

export interface MapInteractionConfig {
  mode: 'work' | 'edit'
  panEnabled: boolean
  zoomEnabled: boolean
  snapPreviewEnabled: boolean
}

export interface MapLayoutRulesConfig {
  collisionEnabled: boolean
  minDistanceSameTypeM: number
  minDistanceDifferentTypeM: number
  marginFromBoundaryM: number
  snapStepM: number
}

export interface MapWalkwayConfig {
  visible: boolean
  defaultWidthM: number
  moduleLengthM: number
  material: 'wood' | 'composite' | 'stone'
}

export const defaultMapCanvasConfig: MapCanvasConfig = {
  beach: bdfDefaultCanvasBeachSettings,
  grid: {
    visible: true,
    stepM: 1,
    majorEveryM: 5,
    opacity: 0.34,
    showMajorLines: true,
    showMinorLines: true,
  },
  background: {
    preset: 'warm_sand',
    textureEnabled: true,
    textureIntensity: 0.28,
    seaGradientEnabled: true,
    vignetteEnabled: true,
  },
  assets: {
    scale: 1.14,
    labelMode: 'always',
    codeDisplayMode: 'sequential_by_family',
    rowLabelMode: 'side_badge',
    rowLabelNumberingMode: 'global',
    rowLabelOverrides: {},
    shadowsEnabled: true,
    highContrastLabels: true,
    selectedRingEnabled: true,
  },
  zones: {
    visible: false,
    opacity: 0.18,
    showLabels: true,
  },
  interaction: {
    mode: 'work',
    panEnabled: true,
    zoomEnabled: true,
    snapPreviewEnabled: false,
  },
  rules: {
    collisionEnabled: false,
    minDistanceSameTypeM: 0.5,
    minDistanceDifferentTypeM: 0.35,
    marginFromBoundaryM: 0.25,
    snapStepM: 0.5,
  },
  walkways: {
    visible: false,
    defaultWidthM: 1.2,
    moduleLengthM: 2,
    material: 'wood',
  },
}
