import type { MapStudioManipulationKind, MapStudioSelectedHandle } from './mapStudioManipulation'
import type { MapStudioScopeId } from './mapStudioScope'
import type { MapStudioToolId } from './mapStudioTools'

export interface MapStudioChangedParameter {
  key: string
  label: string
  currentValue: number
  proposedValue: number
  unit: 'm' | 'px'
}

export interface MapStudioDraftTransaction {
  id: string
  scope: MapStudioScopeId
  tool: MapStudioToolId
  manipulation: MapStudioManipulationKind
  startedAt: number
  changedParameters: MapStudioChangedParameter[]
  previewOnly: boolean
  dirty: boolean
  canCommit: boolean
  canCancel: boolean
}

export const transactionFromHandle = (
  handle: MapStudioSelectedHandle,
  previewOnly = false,
): MapStudioDraftTransaction => ({
  id: `tx-${handle.id}-${Date.now()}`,
  scope: handle.targetScope,
  tool: handle.tool,
  manipulation: handle.manipulation,
  startedAt: Date.now(),
  changedParameters: [{
    key: handle.affectedParameter,
    label: handle.label,
    currentValue: handle.currentValue,
    proposedValue: handle.proposedValue,
    unit: handle.unit,
  }],
  previewOnly,
  dirty: false,
  canCommit: !previewOnly,
  canCancel: true,
})

export const updateTransactionFromHandle = (
  transaction: MapStudioDraftTransaction,
  handle: MapStudioSelectedHandle,
): MapStudioDraftTransaction => ({
  ...transaction,
  changedParameters: transaction.changedParameters.map((parameter) =>
    parameter.key === handle.affectedParameter
      ? { ...parameter, proposedValue: handle.proposedValue }
      : parameter,
  ),
  dirty: Math.abs(handle.proposedValue - handle.currentValue) > 0.005,
  canCommit: !transaction.previewOnly && Math.abs(handle.proposedValue - handle.currentValue) > 0.005,
})
