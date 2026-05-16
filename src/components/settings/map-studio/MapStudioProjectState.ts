import type { MapStudioDomainId } from './mapStudioDomains'
import type { MapStudioLayerId } from './mapStudioLayers'
import { layersForDomain } from './mapStudioLayers'
import type { MapStudioScopeId, MapStudioSelectedEntity } from './state/mapStudioScope'

export type MapStudioPreviewState = 'unavailable' | 'available' | 'stale'
export type MapStudioDirtyState = 'clean' | 'dirty' | 'saving'
export type MapStudioValidationState = 'idle' | 'ready' | 'warnings' | 'invalid'

export interface MapStudioProjectState {
  activeDomain: MapStudioDomainId
  activeLayerSet: MapStudioLayerId[]
  activeScope: MapStudioScopeId
  selectedEntity?: MapStudioSelectedEntity
  hoveredEntity?: MapStudioSelectedEntity
  previewState: MapStudioPreviewState
  dirtyState: MapStudioDirtyState
  validationState: MapStudioValidationState
  activeConfigurationId?: string
  previewConfigurationId?: string
}

export const createMapStudioProjectState = (input: {
  activeConfigurationId?: string
  previewConfigurationId?: string
  previewAvailable: boolean
  warningCount: number
}): MapStudioProjectState => ({
  activeDomain: 'perimeter',
  activeLayerSet: layersForDomain('perimeter'),
  activeScope: 'project',
  previewState: input.previewAvailable ? 'available' : 'unavailable',
  dirtyState: 'clean',
  validationState: input.warningCount > 0 ? 'warnings' : 'ready',
  activeConfigurationId: input.activeConfigurationId,
  previewConfigurationId: input.previewConfigurationId,
})

export const setMapStudioDomain = (
  state: MapStudioProjectState,
  activeDomain: MapStudioDomainId,
): MapStudioProjectState => ({
  ...state,
  activeDomain,
  activeLayerSet: layersForDomain(activeDomain),
})

export const setMapStudioScope = (
  state: MapStudioProjectState,
  activeScope: MapStudioScopeId,
  selectedEntity?: MapStudioSelectedEntity,
): MapStudioProjectState => ({
  ...state,
  activeScope,
  selectedEntity,
})

export const setMapStudioHover = (
  state: MapStudioProjectState,
  hoveredEntity?: MapStudioSelectedEntity,
): MapStudioProjectState => ({
  ...state,
  hoveredEntity,
})

export const clearMapStudioScope = (state: MapStudioProjectState): MapStudioProjectState => ({
  ...state,
  activeScope: 'project',
  selectedEntity: undefined,
  hoveredEntity: undefined,
})
