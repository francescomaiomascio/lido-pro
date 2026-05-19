import type { PricingSnapshotLine } from './pricingSnapshot.types'

export type FolioStatus =
  | 'to_prepare'
  | 'open'
  | 'partial'
  | 'paid'
  | 'cancelled'
  | 'closed'
  | 'manual_review'

export type FolioLineType =
  | 'base_booking'
  | 'article'
  | 'extra'
  | 'service'
  | 'discount'
  | 'manual_adjustment'
  | 'payment_reference'
  | 'credit'
  | 'reversal'

export type FolioSource = 'operator_app' | 'client_web' | 'client_app' | 'import_ai' | 'system'

export type FolioLine = {
  id: string
  folioId: string
  accountId: string
  reservationId?: string | null
  pricingSnapshotId?: string | null
  articleId?: string | null
  type: FolioLineType
  description: string
  quantity: number
  unitAmountCents: number
  totalAmountCents: number
  source: FolioSource
  createdAt: string
  metadata?: Record<string, unknown> | null
}

export type FolioSummary = {
  accountId: string
  reservationId?: string | null
  customerId?: string | null
  totalAmountCents: number
  paidAmountCents: number
  residualAmountCents: number
  status: FolioStatus
  lineCount: number
  paymentCount: number
  pricingSnapshotId?: string | null
  pricingAvailable: boolean
  requiresManualReview: boolean
  updatedAt: string
}

export type FolioOperationResult = {
  summary: FolioSummary
  lines?: FolioLine[]
  warnings: string[]
  requiresManualReview: boolean
}

export type PrepareFolioForBookingInput = {
  reservationId: string
  customerId?: string | null
  itemId?: string | null
  pricingSnapshotId?: string | null
  source: FolioSource
}

export type RebuildFolioLinesInput = {
  accountId: string
  reservationId?: string | null
  pricingSnapshotId?: string | null
  source: FolioSource
}

export type RegisterManualPaymentInput = {
  accountId: string
  amountCents: number
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other'
  note?: string
  source: FolioSource
}

export type ApplyManualAdjustmentInput = {
  accountId: string
  totalAmountCents: number
  reason?: string | null
  source: FolioSource
}

export type CancelFolioForReservationInput = {
  reservationId: string
  source: FolioSource
}

export type FolioLinePreviewContext = {
  snapshotLine: PricingSnapshotLine
  accountId: string
  reservationId?: string | null
  pricingSnapshotId?: string | null
  source: FolioSource
  createdAt: string
}
