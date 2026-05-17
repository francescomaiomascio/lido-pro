import type { BeachDistanceRules } from '../../../../lib/map-canvas'
import type { ParametricSetupState } from '../../../../lib/map-canvas/parametric/parametricSetupState'
import type { MapStudioObjectTypeId, MapStudioRelations } from './mapStudioRelations'
import type { MapStudioScopeId } from './mapStudioScope'

export interface MapStudioElementParameter {
  objectType: MapStudioObjectTypeId
  label: string
  footprintMeters: number
  clearanceMeters: number
  renderScale: string
  labelBehavior: string
  affectedAreas: string[]
  affectedTracks: string[]
  relatedConstraints: string[]
  scopeId: MapStudioScopeId
}

const objectTypeLabels: Record<MapStudioObjectTypeId, string> = {
  palm: 'Palma',
  umbrella: 'Ombrellone',
  small_palm: 'Palmetta',
}

const clearanceKeyByObjectType: Record<MapStudioObjectTypeId, keyof BeachDistanceRules> = {
  palm: 'minPalmGapM',
  umbrella: 'minUmbrellaGapM',
  small_palm: 'minSmallPalmGapM',
}

export const buildMapStudioElementParameters = (
  setup: ParametricSetupState,
  relations: MapStudioRelations,
): MapStudioElementParameter[] =>
  (['umbrella', 'palm', 'small_palm'] as MapStudioObjectTypeId[])
    .map((objectType) => {
      const metric = setup.assetMetrics.find((assetMetric) => assetMetric.family === objectType)
      const rows = relations.tracksByObjectTypeId.get(objectType) ?? []
      const constraints = relations.constraintsByObjectTypeId.get(objectType) ?? []
      const clearanceKey = clearanceKeyByObjectType[objectType]
      const footprintMeters =
        metric?.defaultDiameterM ?? Math.max(metric?.defaultWidthM ?? 0, metric?.defaultHeightM ?? 0)

      return {
        objectType,
        label: objectTypeLabels[objectType],
        footprintMeters,
        clearanceMeters: setup.distanceRules[clearanceKey],
        renderScale: metric?.spacingClass ?? 'metric',
        labelBehavior: rows.length > 1 ? 'Codice riga + progressivo' : 'Codice elemento',
        affectedAreas: [...new Set(rows.map((row) => row.zoneId))],
        affectedTracks: rows.map((row) => row.label),
        relatedConstraints: constraints.map((constraint) => constraint.label),
        scopeId: `objectType:${objectType}` as MapStudioScopeId,
      }
    })
    .filter((parameter) => parameter.footprintMeters > 0)
