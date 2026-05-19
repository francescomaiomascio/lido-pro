import type { AccountStatus } from '../types/account'
import type { FolioStatus } from './folio.types'

export const normalizeAccountStatusToFolioStatus = (
  accountStatus?: AccountStatus | null,
): FolioStatus => {
  if (!accountStatus) return 'to_prepare'
  if (accountStatus === 'open') return 'open'
  if (accountStatus === 'partial') return 'partial'
  if (accountStatus === 'paid') return 'paid'
  if (accountStatus === 'cancelled') return 'cancelled'
  return 'manual_review'
}

export const deriveFolioStatus = (
  totalAmountCents: number,
  paidAmountCents: number,
  residualAmountCents: number,
  accountStatus?: AccountStatus | null,
): FolioStatus => {
  if (accountStatus === 'cancelled') return 'cancelled'
  if (totalAmountCents <= 0) return 'to_prepare'
  if (residualAmountCents <= 0) return 'paid'
  if (paidAmountCents > 0) return 'partial'
  return normalizeAccountStatusToFolioStatus(accountStatus)
}

export const isFolioPaid = (status: FolioStatus): boolean => status === 'paid' || status === 'closed'

export const requiresFolioManualReview = (input: {
  status: FolioStatus
  totalAmountCents: number
  paidAmountCents: number
  residualAmountCents: number
  pricingAvailable?: boolean
}): boolean => {
  if (input.status === 'manual_review') return true
  if (input.pricingAvailable === false) return true
  if (input.paidAmountCents > input.totalAmountCents && input.totalAmountCents > 0) return true
  return input.residualAmountCents < 0
}
