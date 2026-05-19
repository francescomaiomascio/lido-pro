import type { AvailabilityResult } from './availability.types'
import type {
  BookingChangeRequestRecord,
  BookingCustomerPairingCandidateRecord,
  BookingRequestRecord,
} from './bookingPersistence.types'
import type { CustomerPairingStatus } from './customerPairing.types'
import type { RegistryEvent } from '../registry/registryEvent.types'

export type BookingInboxItemKind = 'booking_request' | 'change_request'

export type BookingInboxPriority = 'normal' | 'warning' | 'urgent'

export type BookingInboxAvailabilityStatus =
  | 'not_applicable'
  | 'needs_period'
  | 'needs_item'
  | 'available'
  | 'partial'
  | 'conflict'
  | 'unknown'

export type BookingInboxActionState =
  | 'ready'
  | 'needs_pairing'
  | 'needs_availability'
  | 'blocked'
  | 'review'
  | 'done'

export type BookingInboxSummary = {
  label: string
  detail?: string | null
}

export type BookingInboxItem = {
  id: string
  kind: BookingInboxItemKind
  source: string
  status: string
  priority: BookingInboxPriority
  createdAt: string
  updatedAt: string
  customerSummary: BookingInboxSummary
  periodSummary: BookingInboxSummary
  requestedItemSummary: BookingInboxSummary
  pairingStatus: CustomerPairingStatus | 'not_applicable'
  pairingCandidateCount: number
  availabilityStatus: BookingInboxAvailabilityStatus
  conflictCount: number
  accountImpactStatus?: string | null
  actionState: BookingInboxActionState
  canAccept: boolean
  canReject: boolean
  canConvert: boolean
  canApplyChange: boolean
  disabledReason?: string | null
}

export type BookingInboxFilter = {
  kind?: BookingInboxItemKind | 'all'
  status?: string | 'all'
  source?: string | 'all'
  pairingStatus?: CustomerPairingStatus | 'all'
  availabilityStatus?: BookingInboxAvailabilityStatus | 'all'
  priority?: BookingInboxPriority | 'all'
}

export type BookingInboxAvailableAction =
  | 'refresh_analysis'
  | 'match_existing'
  | 'create_new_customer'
  | 'leave_pending'
  | 'reject'
  | 'accept_convert'
  | 'apply_change'

export type BookingInboxDetail = {
  item: BookingInboxItem
  rawRequest: BookingRequestRecord | BookingChangeRequestRecord
  pairingCandidates: BookingCustomerPairingCandidateRecord[]
  availabilityResult: AvailabilityResult | null
  accountImpactPreview?: Record<string, unknown> | null
  registryEvents?: RegistryEvent[]
  availableActions: BookingInboxAvailableAction[]
}

export type BookingInboxActionResult = {
  item: BookingInboxItem | null
  detail?: BookingInboxDetail | null
  message: string
}
