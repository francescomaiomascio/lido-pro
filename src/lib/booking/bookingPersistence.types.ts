import type {
  BookingConflictSeverity,
  BookingConflictType,
  BookingPairingStatus,
  BookingPeriod,
  BookingPeriodType,
  BookingRequestSource,
  BookingRequestStatus,
  BookingSource,
  BookingStatus,
  BookingSyncState,
  BookingUsageMode,
  BookingCustomerPayload,
  BookingRequestedExtra,
} from './bookingDomain.types'
import type {
  CustomerPairingCandidate,
  CustomerPairingStatus,
  PairingDecision,
} from './customerPairing.types'
import type {
  BookingChangeRequestStatus,
  BookingChangeRequestType,
} from './reservationLifecycle.types'

export type { BookingRequestStatus } from './bookingDomain.types'

export type BookingRequestRecord = {
  id: string
  workspaceId?: string | null
  source: BookingRequestSource
  status: BookingRequestStatus
  pairingStatus: BookingPairingStatus
  matchedCustomerId?: string | null
  pairingDecision?: PairingDecision | null
  pairingResolvedAt?: string | null
  customerPayload: BookingCustomerPayload
  requestedPeriod: BookingPeriod
  requestedItemId?: string | null
  requestedItemType?: string | null
  requestedExtras: BookingRequestedExtra[]
  convertedReservationId?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  syncState?: BookingSyncState | null
  remoteId?: string | null
  version: number
}

export type BookingRequestInput = {
  id?: string
  workspaceId?: string | null
  source: BookingRequestSource
  status?: BookingRequestStatus
  pairingStatus?: BookingPairingStatus
  customerPayload: BookingCustomerPayload
  requestedPeriod: BookingPeriod
  requestedItemId?: string | null
  requestedItemType?: string | null
  requestedExtras?: BookingRequestedExtra[]
}

export type BookingCustomerPairingCandidateRecord = CustomerPairingCandidate
export type BookingCustomerPairingStatus = CustomerPairingStatus
export type BookingCustomerPairingDecision = PairingDecision

export type BookingStatusEventRecord = {
  id: string
  reservationId?: string | null
  requestId?: string | null
  fromStatus?: BookingStatus | BookingRequestStatus | string | null
  toStatus: BookingStatus | BookingRequestStatus | string
  source: BookingSource
  reason?: string | null
  payload?: Record<string, unknown> | null
  createdAt: string
  createdBy?: string | null
  deviceId?: string | null
}

export type BookingStatusEventInput = Omit<BookingStatusEventRecord, 'id' | 'createdAt'> & {
  id?: string
  createdAt?: string
}

export type BookingChangeRequestRecord = {
  id: string
  reservationId: string
  bookingRequestId?: string | null
  source: Exclude<BookingSource, 'sync'>
  type: BookingChangeRequestType
  status: BookingChangeRequestStatus
  payload: Record<string, unknown>
  availabilityResult?: Record<string, unknown> | null
  accountImpact?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  decidedAt?: string | null
  decidedBy?: string | null
}

export type BookingChangeRequestInput = Omit<
  BookingChangeRequestRecord,
  'id' | 'createdAt' | 'updatedAt' | 'status'
> & {
  id?: string
  status?: BookingChangeRequestStatus
  createdAt?: string
  updatedAt?: string
}

export type BookingConflictRecord = {
  id: string
  reservationId?: string | null
  requestId?: string | null
  conflictType: BookingConflictType
  severity: BookingConflictSeverity
  affectedItemIds: string[]
  affectedPeriod: BookingPeriod
  message: string
  status: 'open' | 'resolved' | 'ignored'
  createdAt: string
  resolvedAt?: string | null
}

export type BookingConflictInput = Omit<BookingConflictRecord, 'id' | 'createdAt' | 'resolvedAt' | 'status'> & {
  id?: string
  status?: BookingConflictRecord['status']
  createdAt?: string
}

export type AvailabilityLockRecord = {
  id: string
  workspaceId?: string | null
  itemId: string
  period: BookingPeriod
  source: BookingSource
  reservationId?: string | null
  requestId?: string | null
  status: 'active' | 'released' | 'expired' | 'converted'
  expiresAt?: string | null
  createdAt: string
  updatedAt: string
}

export type AvailabilityLockInput = Omit<AvailabilityLockRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
  id?: string
  status?: AvailabilityLockRecord['status']
  createdAt?: string
  updatedAt?: string
}

export type PricingSnapshotRecord = {
  id: string
  reservationId?: string | null
  accountId?: string | null
  source?: string | null
  status?: 'draft' | 'locked' | 'superseded' | 'voided'
  sourceRuleId?: string | null
  catalogItemId?: string | null
  periodType: BookingPeriodType
  scope?: Record<string, unknown> | null
  basePrice: number
  extrasTotal: number
  discountsTotal?: number
  includedItems: unknown[]
  lines?: unknown[]
  calculatedTotal: number
  manualOverride?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export type PricingSnapshotInput = Omit<PricingSnapshotRecord, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string
  createdAt?: string
  updatedAt?: string
}

export type BookingFolioLinkRecord = {
  id: string
  reservationId: string
  accountId: string
  status: 'to_prepare' | 'open' | 'partial' | 'paid' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export type BookingFolioLinkInput = Omit<BookingFolioLinkRecord, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string
  createdAt?: string
  updatedAt?: string
}

export type BookingRegistryEventLinkRecord = {
  id: string
  reservationId?: string | null
  requestId?: string | null
  registryEventId: string
  eventType: string
  createdAt: string
}

export type BookingRegistryEventLinkInput = Omit<BookingRegistryEventLinkRecord, 'id' | 'createdAt'> & {
  id?: string
  createdAt?: string
}

export type ReservationBookingMetadata = {
  source: BookingSource
  bookingMode: BookingUsageMode
  bookingStatus: BookingStatus
  periodType: BookingPeriodType
  syncState: BookingSyncState
  remoteId?: string | null
  version: number
  deletedAt?: string | null
  pricingSnapshotId?: string | null
  folioId?: string | null
  requestId?: string | null
}
