import type { MapStudioDomainId } from './mapStudioDomains'
import type { MapStudioLayerId } from './mapStudioLayers'
import { layersForDomain } from './mapStudioLayers'
import {
  createEmptyMapStudioProjectDraft,
  applyDraftTransaction,
  type MapStudioProjectDraft,
} from './state/mapStudioProjectDraft'
import {
  applyTransactionToProjectModel,
  type MapStudioProjectModel,
} from './state/mapStudioProjectModel'
import {
  type MapStudioManipulationKind,
  type MapStudioSelectedHandle,
} from './state/mapStudioManipulation'
import {
  transactionFromHandle,
  updateTransactionFromHandle,
  type MapStudioDraftTransaction,
} from './state/mapStudioTransactions'
import { defaultToolForDomain, type MapStudioToolId } from './state/mapStudioActions'
import type { MapStudioScopeId, MapStudioSelectedEntity } from './state/mapStudioScope'

export type MapStudioPreviewState = 'unavailable' | 'available' | 'stale'
export type MapStudioDirtyState = 'clean' | 'dirty' | 'saving'
export type MapStudioValidationState = 'idle' | 'ready' | 'warnings' | 'invalid'

export interface MapStudioProjectState {
  activeDomain: MapStudioDomainId
  activeLayerSet: MapStudioLayerId[]
  activeTool: MapStudioToolId
  activeManipulation: MapStudioManipulationKind
  activeScope: MapStudioScopeId
  selectedEntity?: MapStudioSelectedEntity
  hoveredEntity?: MapStudioSelectedEntity
  selectedHandle?: MapStudioSelectedHandle
  draftTransaction?: MapStudioDraftTransaction
  projectDraft: MapStudioProjectDraft
  projectModel: MapStudioProjectModel
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
  projectModel: MapStudioProjectModel
}): MapStudioProjectState => ({
  activeDomain: 'perimeter',
  activeLayerSet: input.projectModel.sourceMode === 'empty'
    ? ['usable.boundary', 'selection.focus']
    : layersForDomain('perimeter'),
  activeTool: 'perimeterEdit',
  activeManipulation: 'none',
  activeScope: 'project',
  projectDraft: createEmptyMapStudioProjectDraft(),
  projectModel: input.projectModel,
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
  activeTool: defaultToolForDomain(activeDomain),
  activeManipulation: 'none',
})

export const setMapStudioTool = (
  state: MapStudioProjectState,
  activeTool: MapStudioToolId,
): MapStudioProjectState => ({
  ...state,
  activeTool,
  activeManipulation: 'none',
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

export const startMapStudioManipulation = (
  state: MapStudioProjectState,
  handle: MapStudioSelectedHandle,
  previewOnly = false,
): MapStudioProjectState => ({
  ...state,
  activeTool: handle.tool,
  activeManipulation: handle.manipulation,
  activeScope: handle.targetScope,
  selectedHandle: handle,
  draftTransaction: transactionFromHandle(handle, previewOnly),
})

export const updateMapStudioManipulation = (
  state: MapStudioProjectState,
  handle: MapStudioSelectedHandle,
): MapStudioProjectState => {
  const draftTransaction = state.draftTransaction
    ? updateTransactionFromHandle(state.draftTransaction, handle)
    : transactionFromHandle(handle, handle.manipulation === 'measureDistance')
  return {
    ...state,
    selectedHandle: handle,
    draftTransaction,
  }
}

export const finishMapStudioManipulation = (state: MapStudioProjectState): MapStudioProjectState => ({
  ...state,
  activeManipulation: 'none',
})

export const cancelMapStudioManipulation = (state: MapStudioProjectState): MapStudioProjectState => ({
  ...state,
  activeManipulation: 'none',
  selectedHandle: undefined,
  draftTransaction: undefined,
})

export const commitMapStudioManipulation = (state: MapStudioProjectState): MapStudioProjectState => {
  if (!state.draftTransaction?.canCommit) return state
  return {
    ...state,
    activeManipulation: 'none',
    selectedHandle: undefined,
    draftTransaction: undefined,
    projectDraft: applyDraftTransaction(state.projectDraft, state.draftTransaction),
    projectModel: applyTransactionToProjectModel(state.projectModel, state.draftTransaction),
    dirtyState: 'dirty',
    validationState: 'idle',
    previewState: state.previewState === 'available' ? 'stale' : state.previewState,
  }
}
