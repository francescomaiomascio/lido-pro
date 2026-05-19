import type { BookingPeriodType, BookingUsageMode } from './bookingDomain.types'
import type { NormalizedBookingPeriod } from './bookingPeriod.types'
import type { PricingSnapshotRecord } from './bookingPersistence.types'

export type PricingSnapshotSource = 'operator_app' | 'client_web' | 'client_app' | 'import_ai' | 'system'

export type PricingSnapshotStatus = 'draft' | 'locked' | 'superseded' | 'voided'

export type PricingSnapshotScope = {
  reservationId: string
  itemId?: string | null
  itemKind?: string | null
  rowKey?: string | null
  zoneId?: string | null
  periodType: BookingPeriodType
  periodStart: string
  periodEnd?: string | null
  customerId?: string | null
}

export type PricingSnapshotLineType =
  | 'base_item'
  | 'included_item'
  | 'extra'
  | 'discount'
  | 'manual_adjustment'
  | 'service'

export type PricingSnapshotLine = {
  id: string
  type: PricingSnapshotLineType
  articleId?: string | null
  sourceRuleId?: string | null
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  included: boolean
  metadata?: Record<string, unknown> | null
}

export type PricingSnapshotManualOverride = {
  enabled: boolean
  amountCents: number
  reason?: string | null
  source?: PricingSnapshotSource | null
  previousAmountCents?: number | null
  updatedAt?: string | null
}

export type PricingSnapshot = Omit<
  PricingSnapshotRecord,
  'reservationId' | 'manualOverride' | 'source' | 'status' | 'discountsTotal' | 'lines' | 'scope'
> & {
  reservationId: string
  accountId?: string | null
  source: PricingSnapshotSource
  status: PricingSnapshotStatus
  discountsTotal: number
  lines: PricingSnapshotLine[]
  scope: PricingSnapshotScope
  manualOverride?: PricingSnapshotManualOverride | null
}

export type PricingSnapshotInput = {
  reservationId: string
  accountId?: string | null
  itemId?: string | null
  customerId?: string | null
  period?: NormalizedBookingPeriod
  source: PricingSnapshotSource
  mode?: BookingUsageMode
  manualOverride?: PricingSnapshotManualOverride | null
  persist?: boolean
}

export type PricingSnapshotResult = {
  snapshot: PricingSnapshot
  warnings: string[]
  pricingAvailable: boolean
  requiresManualReview: boolean
}
