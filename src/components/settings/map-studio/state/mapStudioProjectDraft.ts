import type { MapStudioChangedParameter, MapStudioDraftTransaction } from './mapStudioTransactions'

export interface MapStudioProjectDraft {
  changedParameters: MapStudioChangedParameter[]
  dirty: boolean
  verificationStale: boolean
  previewStale: boolean
}

export const createEmptyMapStudioProjectDraft = (): MapStudioProjectDraft => ({
  changedParameters: [],
  dirty: false,
  verificationStale: false,
  previewStale: false,
})

export const applyDraftTransaction = (
  draft: MapStudioProjectDraft,
  transaction: MapStudioDraftTransaction,
): MapStudioProjectDraft => ({
  changedParameters: [
    ...draft.changedParameters.filter((parameter) =>
      !transaction.changedParameters.some((changed) => changed.key === parameter.key),
    ),
    ...transaction.changedParameters,
  ],
  dirty: true,
  verificationStale: true,
  previewStale: true,
})
