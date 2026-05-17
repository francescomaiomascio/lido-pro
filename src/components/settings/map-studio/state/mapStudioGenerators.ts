import type {
  ParametricSetupAssetMetric,
  ParametricSetupState,
  ParametricSetupZone,
} from '../../../../lib/map-canvas/parametric/parametricSetupState'
import type { MapStudioProjectModel } from './mapStudioProjectModel'

const cumulativeAreas = (model: MapStudioProjectModel): ParametricSetupZone[] => {
  let yM = 0
  return model.functionalAreas
    .filter((area) => area.enabled && area.depthM > 0)
    .sort((a, b) => a.order - b.order)
    .map((area) => {
      const zone = {
        id: area.id,
        label: area.label,
        type: area.type,
        xM: 0,
        yM,
        widthM: model.perimeter.widthM,
        heightM: area.depthM,
        locked: false,
        visible: true,
        allowedAssetFamilies: [...area.allowedAssetFamilies],
      }
      yM += area.depthM
      return zone
    })
}

export const projectModelToParametricSetup = (
  model: MapStudioProjectModel,
  baseSetup: ParametricSetupState,
): ParametricSetupState => {
  const zones = cumulativeAreas(model)
  const zonesById = new Map(zones.map((zone) => [zone.id, zone]))
  const assetMetrics: ParametricSetupAssetMetric[] = baseSetup.assetMetrics.map((asset) => {
    const parameter = model.objectParameters.find((candidate) => candidate.objectType === asset.family)
    if (!parameter) return { ...asset, locked: false }
    return {
      ...asset,
      defaultWidthM: parameter.footprintMeters,
      defaultHeightM: parameter.footprintMeters,
      defaultDiameterM: parameter.footprintMeters,
      locked: false,
    }
  })

  return {
    layoutVersionId: model.id,
    status: model.previewState === 'available' ? 'draft_calculated' : 'draft_editing',
    beach: {
      name: model.perimeter.name,
      widthM: model.perimeter.widthM,
      depthM: model.perimeter.depthM,
      seaSide: model.perimeter.seaSide,
      marginsM: { ...model.perimeter.marginsM },
    },
    zones,
    rows: model.tracks
      .filter((track) => track.enabled && zonesById.has(track.areaId))
      .map((track) => {
        const zone = zonesById.get(track.areaId)!
        return {
          id: track.id,
          label: track.label,
          family: track.family,
          zoneId: track.areaId,
          itemCount: track.itemCount,
          yM: track.yM === null ? null : zone.yM + track.yM,
          minGapM: track.minGapM,
          distributionMode: track.distributionMode,
          locked: false,
          assetVariantId: track.assetVariantId,
          startMarginM: track.startMarginM,
          endMarginM: track.endMarginM,
          distributionAxis: 'x' as const,
        }
      }),
    assetMetrics,
    distanceRules: { ...model.metricConstraints },
  }
}
