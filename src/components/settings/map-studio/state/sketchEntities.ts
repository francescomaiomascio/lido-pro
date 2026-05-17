import type { MapStudioProjectModel } from './mapStudioProjectModel'
import type { MapStudioObjectTypeId } from './mapStudioRelations'

export type SketchEntityKind =
  | 'perimeter'
  | 'usableBoundary'
  | 'seaEdge'
  | 'functionalArea'
  | 'track'
  | 'objectFootprint'
  | 'clearance'
  | 'distanceConstraint'
  | 'marginConstraint'
  | 'constructionGuide'
  | 'label'

export interface SketchEntity {
  id: string
  kind: SketchEntityKind
  label: string
  scopeId: string
  areaId?: string
  trackId?: string
  objectType?: MapStudioObjectTypeId
  xM: number
  yM: number
  widthM: number
  depthM: number
  locked?: boolean
}

export const buildSketchEntities = (model: MapStudioProjectModel): SketchEntity[] => {
  const entities: SketchEntity[] = [
    {
      id: 'perimeter',
      kind: 'perimeter',
      label: model.perimeter.name,
      scopeId: 'perimeter',
      xM: 0,
      yM: 0,
      widthM: model.perimeter.widthM,
      depthM: model.perimeter.depthM,
    },
    {
      id: 'usable-boundary',
      kind: 'usableBoundary',
      label: 'Perimetro utile',
      scopeId: 'perimeter',
      xM: model.perimeter.marginsM.left,
      yM: model.perimeter.marginsM.top,
      widthM: Math.max(0, model.perimeter.widthM - model.perimeter.marginsM.left - model.perimeter.marginsM.right),
      depthM: Math.max(0, model.perimeter.depthM - model.perimeter.marginsM.top - model.perimeter.marginsM.bottom),
    },
  ]

  let areaTop = 0
  for (const area of [...model.functionalAreas].sort((a, b) => a.order - b.order)) {
    if (!area.enabled) continue
    entities.push({
      id: `area-${area.id}`,
      kind: 'functionalArea',
      label: area.label,
      scopeId: `area:${area.id}`,
      areaId: area.id,
      xM: 0,
      yM: areaTop,
      widthM: model.perimeter.widthM,
      depthM: area.depthM,
    })

    for (const track of model.tracks.filter((candidate) => candidate.enabled && candidate.areaId === area.id)) {
      const trackY = areaTop + (track.yM ?? area.depthM / 2)
      entities.push({
        id: `track-${track.id}`,
        kind: 'track',
        label: track.label,
        scopeId: `track:${track.id}`,
        areaId: area.id,
        trackId: track.id,
        objectType: track.family,
        xM: track.startMarginM,
        yM: trackY,
        widthM: Math.max(0, model.perimeter.widthM - track.startMarginM - track.endMarginM),
        depthM: 0,
      })
    }
    areaTop += area.depthM
  }

  return entities
}

export const sketchEntityCount = (entities: SketchEntity[], kind: SketchEntityKind) =>
  entities.filter((entity) => entity.kind === kind).length
