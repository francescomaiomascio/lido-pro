export type MeasurementUnit = 'm'

export type SeaSide = 'top' | 'right' | 'bottom' | 'left'

export type CanvasMapMode = 'work' | 'edit'

export interface MetricPoint {
  xM: number
  yM: number
}

export interface MetricSize {
  widthM: number
  heightM: number
}

export interface MetricRect {
  xM: number
  yM: number
  widthM: number
  heightM: number
}

export interface BeachMargins {
  leftM: number
  rightM: number
  topM: number
  bottomM: number
}

export interface CanvasBeachSettings {
  widthM: number
  depthM: number
  unit: MeasurementUnit
  seaSide: SeaSide
  margins: BeachMargins
  gridStepM: number
  snapStepM: number
}

export interface CanvasCamera {
  zoom: number
  panXPx: number
  panYPx: number
  devicePixelRatio: number
}

export interface CanvasViewport {
  widthPx: number
  heightPx: number
}

export interface CanvasTransformInput {
  settings: CanvasBeachSettings
  camera: CanvasCamera
  viewport: CanvasViewport
}

export type CanvasAssetType =
  | 'palm'
  | 'medium_palm'
  | 'small_palm'
  | 'umbrella'
  | 'sunbed'
  | 'deck_chair'
  | 'chair'
  | 'armchair'
  | 'walkway_tile'
  | 'service'
  | 'custom'

export interface CanvasMapElement {
  id: string
  assetType: CanvasAssetType
  code: string
  rowLabel: string
  storedNumber: number
  sequentialNumber: number
  xM: number
  yM: number
  widthM: number
  heightM: number
  rotationDeg: number
  locked: boolean
  active: boolean
  zIndex: number
}

export interface CanvasGridLine {
  from: MetricPoint
  to: MetricPoint
  major: boolean
}
