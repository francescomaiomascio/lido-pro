import type { BeachDistanceRules } from '../../../../lib/map-canvas'
import type { ParametricLayoutOutput } from '../../../../lib/map-canvas/parametric/parametricLayoutEngine'
import type { ParametricSetupState } from '../../../../lib/map-canvas/parametric/parametricSetupState'
import type { MapStudioProjectState } from '../MapStudioProjectState'
import {
  buildMapStudioElementParameters,
  type MapStudioElementParameter,
} from './mapStudioElementParameters'
import { buildMapStudioRelations, type MapStudioRelations } from './mapStudioRelations'
import {
  getActiveDomain,
  getActiveLayerSet,
  getActiveScope,
  getBoardEmphasisModel,
  getDockModel,
  getScopedAreas,
  getScopedConstraints,
  getScopedItems,
  getScopedObjectTypes,
  getScopedTracks,
  getScopedWarnings,
  type MapStudioBoardEmphasisModel,
  type MapStudioDockModel,
} from './mapStudioSelectors'

export interface MapStudioControlPlane {
  activeScope: ReturnType<typeof getActiveScope>
  activeDomain: ReturnType<typeof getActiveDomain>
  activeLayerSet: ReturnType<typeof getActiveLayerSet>
  relations: MapStudioRelations
  dockModel: MapStudioDockModel
  boardEmphasis: MapStudioBoardEmphasisModel
  scopedAreas: ReturnType<typeof getScopedAreas>
  scopedTracks: ReturnType<typeof getScopedTracks>
  scopedObjectTypes: ReturnType<typeof getScopedObjectTypes>
  scopedItems: ReturnType<typeof getScopedItems>
  scopedConstraints: ReturnType<typeof getScopedConstraints>
  scopedWarnings: ReturnType<typeof getScopedWarnings>
  elementParameters: MapStudioElementParameter[]
}

export function buildMapStudioControlPlane(input: {
  setup: ParametricSetupState
  output: ParametricLayoutOutput | null
  state: MapStudioProjectState
  distanceRows: Array<{ label: string; key: keyof BeachDistanceRules; hint: string }>
  draftAvailable: boolean
}): MapStudioControlPlane {
  const { setup, output, state, distanceRows, draftAvailable } = input
  const relations = buildMapStudioRelations({ setup, output, distanceRows })
  const elementParameters = buildMapStudioElementParameters(setup, relations)
  return {
    activeScope: getActiveScope(state),
    activeDomain: getActiveDomain(state),
    activeLayerSet: getActiveLayerSet(state),
    relations,
    dockModel: getDockModel({ setup, output, state, relations, distanceRows, draftAvailable }),
    boardEmphasis: getBoardEmphasisModel(state, relations),
    scopedAreas: getScopedAreas(state, relations),
    scopedTracks: getScopedTracks(state, relations),
    scopedObjectTypes: getScopedObjectTypes(state, relations),
    scopedItems: getScopedItems(state, relations),
    scopedConstraints: getScopedConstraints(state, relations),
    scopedWarnings: getScopedWarnings(state, relations),
    elementParameters,
  }
}
