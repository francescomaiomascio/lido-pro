import type { MapStudioToolId } from './mapStudioTools'
import type { MapStudioScopeId } from './mapStudioScope'

export type MapStudioManipulationKind =
  | 'none'
  | 'dragHandle'
  | 'resizeBand'
  | 'moveTrack'
  | 'adjustSpacing'
  | 'editFootprint'
  | 'editClearance'
  | 'measureDistance'

export type MapStudioHandleKind =
  | 'perimeter-side'
  | 'perimeter-corner'
  | 'margin-guide'
  | 'area-boundary'
  | 'track-line'
  | 'spacing-guide'
  | 'footprint-radius'
  | 'clearance-radius'
  | 'constraint-distance'
  | 'measurement-distance'

export interface MapStudioSelectedHandle {
  kind: MapStudioHandleKind
  id: string
  label: string
  targetScope: MapStudioScopeId
  tool: MapStudioToolId
  manipulation: MapStudioManipulationKind
  affectedParameter: string
  currentValue: number
  proposedValue: number
  unit: 'm' | 'px'
}

export const manipulationStateLabel = (input: {
  activeManipulation: MapStudioManipulationKind
  hasDraftTransaction: boolean
  hasProjectDraft: boolean
  previewState: 'unavailable' | 'available' | 'stale'
}) => {
  if (input.activeManipulation !== 'none') return 'modifica in corso'
  if (input.hasDraftTransaction) return 'modifica non salvata'
  if (input.hasProjectDraft) return 'verifica da aggiornare'
  if (input.previewState === 'stale') return 'anteprima non aggiornata'
  if (input.previewState === 'available') return 'anteprima disponibile'
  return 'nessuna modifica'
}

export const formatHandleValue = (value: number, unit: 'm' | 'px') =>
  `${value.toFixed(unit === 'm' ? 2 : 0).replace('.', ',')}${unit}`
