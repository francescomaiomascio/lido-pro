import type { SeaSide } from '../../../../lib/map-canvas/types'
import type { BeachDistanceRules } from '../../../../lib/map-canvas'
import type { ParametricSetupState } from '../../../../lib/map-canvas/parametric/parametricSetupState'
import type { MapStudioObjectTypeId } from './mapStudioRelations'
import type { MapStudioDraftTransaction } from './mapStudioTransactions'

export type MapStudioProjectEntryMode = 'empty' | 'template' | 'existing'
export type MapStudioProjectStage =
  | 'perimeter'
  | 'areas'
  | 'tracks'
  | 'footprints'
  | 'constraints'
  | 'verification'
  | 'preview'
  | 'publication'

export interface MapStudioProjectPerimeter {
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

export interface MapStudioProjectArea {
  id: string
  label: string
  type: string
  depthM: number
  enabled: boolean
  order: number
  allowedAssetFamilies: string[]
}

export interface MapStudioProjectTrack {
  id: string
  label: string
  family: MapStudioObjectTypeId
  areaId: string
  itemCount: number
  yM: number | null
  minGapM: number | null
  enabled: boolean
  distributionMode: 'uniform' | 'manual_future'
  assetVariantId: string | null
  startMarginM: number
  endMarginM: number
}

export interface MapStudioObjectParameter {
  objectType: MapStudioObjectTypeId
  label: string
  assetId: string
  footprintMeters: number
  clearanceMeters: number
  renderScale: string
  labelBehavior: string
}

export interface MapStudioProjectModel {
  id: string
  sourceMode: MapStudioProjectEntryMode
  stage: MapStudioProjectStage
  perimeter: MapStudioProjectPerimeter
  functionalAreas: MapStudioProjectArea[]
  tracks: MapStudioProjectTrack[]
  objectParameters: MapStudioObjectParameter[]
  metricConstraints: BeachDistanceRules
  verificationState: 'idle' | 'ready' | 'warnings' | 'invalid' | 'stale'
  previewState: 'unavailable' | 'available' | 'stale'
  publicationState: 'protected' | 'draft' | 'published'
}

export const projectModeLabel = (mode: MapStudioProjectEntryMode) => {
  if (mode === 'empty') return 'Progetto vuoto'
  if (mode === 'template') return 'Bozza da layout base'
  return 'Configurazione progetto'
}

export const projectModelElementCount = (model: MapStudioProjectModel) =>
  model.tracks.filter((track) => track.enabled).reduce((total, track) => total + track.itemCount, 0)

export const projectStageForModel = (model: MapStudioProjectModel): MapStudioProjectStage => {
  if (!model.functionalAreas.some((area) => area.enabled)) return 'perimeter'
  if (!model.tracks.some((track) => track.enabled)) return 'areas'
  if (!model.objectParameters.length) return 'tracks'
  if (model.stage === 'publication' || model.stage === 'preview' || model.stage === 'verification' || model.stage === 'constraints') return model.stage
  if (model.previewState === 'available') return 'preview'
  return 'constraints'
}

export const projectModelFromSetup = (
  setup: ParametricSetupState,
  sourceMode: MapStudioProjectEntryMode,
): MapStudioProjectModel => {
  const cumulativeAreaTop = new Map<string, number>()
  const sortedZones = setup.zones
    .filter((zone) => zone.visible !== false)
    .sort((a, b) => a.yM - b.yM)
  let top = 0
  for (const zone of sortedZones) {
    cumulativeAreaTop.set(zone.id, top)
    top += zone.heightM
  }
  const objectTypes = ['umbrella', 'palm', 'small_palm'] as MapStudioObjectTypeId[]
  return {
    id: `${setup.layoutVersionId}-${sourceMode}`,
    sourceMode,
    stage: sourceMode === 'empty' ? 'perimeter' : 'verification',
    perimeter: {
      name: setup.beach.name,
      widthM: setup.beach.widthM,
      depthM: setup.beach.depthM,
      seaSide: setup.beach.seaSide,
      marginsM: { ...setup.beach.marginsM },
    },
    functionalAreas: sortedZones.map((zone, index) => ({
      id: zone.id,
      label: zone.label,
      type: zone.type,
      depthM: zone.heightM,
      enabled: zone.visible !== false && zone.heightM > 0,
      order: index,
      allowedAssetFamilies: [...zone.allowedAssetFamilies],
    })),
    tracks: setup.rows
      .filter((row) => objectTypes.includes(row.family as MapStudioObjectTypeId))
      .map((row) => ({
        id: row.id,
        label: row.label,
        family: row.family as MapStudioObjectTypeId,
        areaId: row.zoneId,
        itemCount: row.itemCount,
        yM: row.yM === null ? null : row.yM - (cumulativeAreaTop.get(row.zoneId) ?? 0),
        minGapM: row.minGapM,
        enabled: true,
        distributionMode: row.distributionMode === 'manual_future' ? 'manual_future' : 'uniform',
        assetVariantId: row.assetVariantId,
        startMarginM: row.startMarginM,
        endMarginM: row.endMarginM,
      })),
    objectParameters: objectTypes.flatMap((objectType) => {
      const metric = setup.assetMetrics.find((asset) => asset.family === objectType)
      if (!metric) return []
      const footprintMeters = metric.defaultDiameterM ?? Math.max(metric.defaultWidthM, metric.defaultHeightM)
      const constraintKey =
        objectType === 'umbrella'
          ? 'minUmbrellaGapM'
          : objectType === 'small_palm'
            ? 'minSmallPalmGapM'
            : 'minPalmGapM'
      return [{
        objectType,
        label: objectType === 'umbrella' ? 'Ombrellone' : objectType === 'small_palm' ? 'Palmetta' : 'Palma',
        assetId: metric.assetId,
        footprintMeters,
        clearanceMeters: setup.distanceRules[constraintKey],
        renderScale: metric.spacingClass,
        labelBehavior: 'Codice riga + progressivo',
      }]
    }),
    metricConstraints: { ...setup.distanceRules },
    verificationState: 'ready',
    previewState: sourceMode === 'empty' ? 'unavailable' : 'stale',
    publicationState: sourceMode === 'existing' ? 'protected' : 'draft',
  }
}

const constraintKeyFromTransaction = (parameterKey: string, model: MapStudioProjectModel): keyof BeachDistanceRules | null => {
  if (parameterKey.startsWith('metric:')) return parameterKey.slice('metric:'.length) as keyof BeachDistanceRules
  if (!parameterKey.startsWith('constraint-')) return null
  const rowId = parameterKey.slice('constraint-'.length)
  const track = model.tracks.find((candidate) => candidate.id === rowId)
  if (!track) return null
  if (track.family === 'umbrella') return 'minUmbrellaGapM'
  if (track.family === 'small_palm') return 'minSmallPalmGapM'
  return 'minPalmGapM'
}

export const applyTransactionToProjectModel = (
  model: MapStudioProjectModel,
  transaction: MapStudioDraftTransaction,
): MapStudioProjectModel => {
  let nextModel: MapStudioProjectModel = {
    ...model,
    perimeter: { ...model.perimeter, marginsM: { ...model.perimeter.marginsM } },
    functionalAreas: model.functionalAreas.map((area) => ({ ...area })),
    tracks: model.tracks.map((track) => ({ ...track })),
    objectParameters: model.objectParameters.map((parameter) => ({ ...parameter })),
    metricConstraints: { ...model.metricConstraints },
    verificationState: 'stale',
    previewState: model.previewState === 'available' ? 'stale' : model.previewState,
    publicationState: 'draft',
  }

  for (const parameter of transaction.changedParameters) {
    const value = parameter.proposedValue
    if (parameter.key === 'beach.widthM') nextModel.perimeter.widthM = value
    if (parameter.key === 'beach.depthM') nextModel.perimeter.depthM = value
    if (parameter.key === 'beach.marginsM.top') nextModel.perimeter.marginsM.top = value

    if (parameter.key.startsWith('zone.') && parameter.key.endsWith('.heightM')) {
      const areaId = parameter.key.slice('zone.'.length, -'.heightM'.length)
      nextModel.functionalAreas = nextModel.functionalAreas.map((area) =>
        area.id === areaId ? { ...area, depthM: value, enabled: true } : area,
      )
    }

    if (parameter.key.startsWith('row.') && parameter.key.endsWith('.yM')) {
      const rowId = parameter.key.slice('row.'.length, -'.yM'.length)
      nextModel.tracks = nextModel.tracks.map((track) =>
        track.id === rowId ? { ...track, yM: value, enabled: true } : track,
      )
    }

    if (parameter.key.startsWith('objectType.') && parameter.key.endsWith('.footprintMeters')) {
      const objectType = parameter.key.slice('objectType.'.length, -'.footprintMeters'.length) as MapStudioObjectTypeId
      nextModel.objectParameters = nextModel.objectParameters.map((objectParameter) =>
        objectParameter.objectType === objectType
          ? { ...objectParameter, footprintMeters: value }
          : objectParameter,
      )
    }

    const constraintKey = constraintKeyFromTransaction(parameter.key, nextModel)
    if (constraintKey) {
      nextModel.metricConstraints[constraintKey] = value
      nextModel.objectParameters = nextModel.objectParameters.map((objectParameter) => {
        if (constraintKey === 'minUmbrellaGapM' && objectParameter.objectType === 'umbrella') return { ...objectParameter, clearanceMeters: value }
        if (constraintKey === 'minPalmGapM' && objectParameter.objectType === 'palm') return { ...objectParameter, clearanceMeters: value }
        if (constraintKey === 'minSmallPalmGapM' && objectParameter.objectType === 'small_palm') return { ...objectParameter, clearanceMeters: value }
        return objectParameter
      })
    }
  }

  nextModel = { ...nextModel, stage: projectStageForModel(nextModel) }
  return nextModel
}

export const initializeDefaultAreas = (model: MapStudioProjectModel): MapStudioProjectModel => {
  if (model.functionalAreas.some((area) => area.enabled)) return model
  const depth = model.perimeter.depthM
  const seaDepth = Math.min(3, depth * 0.12)
  const palmsDepth = Math.max(1.5, depth * 0.42)
  const umbrellasDepth = Math.max(1.5, depth * 0.28)
  const smallPalmsDepth = Math.max(1, depth * 0.1)
  const used = seaDepth + palmsDepth + umbrellasDepth + smallPalmsDepth
  const emptyDepth = Math.max(0.5, depth - used)
  return {
    ...model,
    stage: 'tracks',
    functionalAreas: [
      { id: 'sea-entry', label: 'Mare / ingresso', type: 'sea_entry', depthM: seaDepth, enabled: true, order: 0, allowedAssetFamilies: [] },
      { id: 'palms', label: 'Palme', type: 'palm_zone', depthM: palmsDepth, enabled: true, order: 1, allowedAssetFamilies: ['palm'] },
      { id: 'umbrellas', label: 'Ombrelloni', type: 'umbrella_zone', depthM: umbrellasDepth, enabled: true, order: 2, allowedAssetFamilies: ['umbrella'] },
      { id: 'small-palms', label: 'Palmette', type: 'small_palm_zone', depthM: smallPalmsDepth, enabled: true, order: 3, allowedAssetFamilies: ['small_palm'] },
      { id: 'empty', label: 'Vuota', type: 'empty_zone', depthM: emptyDepth, enabled: true, order: 4, allowedAssetFamilies: [] },
    ],
    verificationState: 'stale',
    previewState: model.previewState === 'available' ? 'stale' : model.previewState,
  }
}

export const initializeDefaultTracks = (model: MapStudioProjectModel): MapStudioProjectModel => {
  if (model.tracks.some((track) => track.enabled)) return model
  const areaById = new Map(model.functionalAreas.map((area) => [area.id, area]))
  const track = (
    id: string,
    label: string,
    family: MapStudioObjectTypeId,
    areaId: string,
    yRatio: number,
  ): MapStudioProjectTrack | null => {
    const area = areaById.get(areaId)
    if (!area) return null
    return {
      id,
      label,
      family,
      areaId,
      itemCount: 0,
      yM: area.depthM * yRatio,
      minGapM: null,
      enabled: true,
      distributionMode: 'uniform',
      assetVariantId: null,
      startMarginM: 0.5,
      endMarginM: 0.5,
    }
  }
  const tracks = [
    track('P1', 'P1', 'palm', 'palms', 0.16),
    track('P2', 'P2', 'palm', 'palms', 0.38),
    track('P3', 'P3', 'palm', 'palms', 0.62),
    track('P4', 'P4', 'palm', 'palms', 0.84),
    track('O1', 'O1', 'umbrella', 'umbrellas', 0.34),
    track('O2', 'O2', 'umbrella', 'umbrellas', 0.7),
    track('PM', 'PM', 'small_palm', 'small-palms', 0.5),
  ].filter(Boolean) as MapStudioProjectTrack[]
  return {
    ...model,
    stage: 'footprints',
    tracks,
    verificationState: 'stale',
    previewState: model.previewState === 'available' ? 'stale' : model.previewState,
  }
}

export const confirmProjectPerimeter = (model: MapStudioProjectModel): MapStudioProjectModel => ({
  ...model,
  stage: model.stage === 'perimeter' ? 'areas' : model.stage,
  verificationState: 'stale',
  previewState: model.previewState === 'available' ? 'stale' : model.previewState,
  publicationState: 'draft',
})

export const initializeDefaultObjectParameters = (
  model: MapStudioProjectModel,
  baseSetup: ParametricSetupState,
): MapStudioProjectModel => {
  if (model.objectParameters.length > 0) return model
  const template = projectModelFromSetup(baseSetup, 'template')
  return {
    ...model,
    stage: 'constraints',
    objectParameters: template.objectParameters,
    verificationState: 'stale',
    previewState: model.previewState === 'available' ? 'stale' : model.previewState,
    publicationState: 'draft',
  }
}

export const confirmProjectConstraints = (model: MapStudioProjectModel): MapStudioProjectModel => ({
  ...model,
  stage: 'verification',
  verificationState: 'stale',
  previewState: model.previewState === 'available' ? 'stale' : model.previewState,
  publicationState: 'draft',
})
