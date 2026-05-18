export type BookingUsageMode =
  | 'operator_app'
  | 'client_web'
  | 'client_app'
  | 'sync_cloud'
  | 'import_ai'

export type BookingSource =
  | 'operator'
  | 'client_web'
  | 'client_app'
  | 'import'
  | 'ai_draft'
  | 'sync'
  | 'system'

export type BookingStatus =
  | 'draft'
  | 'requested'
  | 'pending_operator_review'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired'
  | 'no_show'
  | 'archived'

export type BookingRequestStatus =
  | 'new'
  | 'needs_pairing'
  | 'matched'
  | 'availability_pending'
  | 'operator_review'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted_to_booking'

export type BookingPeriodType = 'daily' | 'multi_day' | 'seasonal' | 'custom'

export type BookingRequestSource = Extract<BookingSource, 'client_web' | 'client_app' | 'import' | 'ai_draft'>

export type BookingPairingStatus =
  | 'unpaired'
  | 'candidate_found'
  | 'matched_existing'
  | 'new_customer_required'
  | 'manually_resolved'

export type CustomerPairingDecision =
  | 'match_existing'
  | 'create_new'
  | 'leave_unpaired'
  | 'reject_request'

export type CustomerPairingReason =
  | 'phone'
  | 'email'
  | 'name'
  | 'previous_booking'
  | 'manual_note'

export type BookingAssignmentStatus = 'draft' | 'confirmed' | 'active' | 'released' | 'cancelled'

export type BookingConflictType =
  | 'overlapping_reservation'
  | 'active_lock'
  | 'item_unavailable'
  | 'maintenance'
  | 'invalid_period'
  | 'missing_item'
  | 'period_overlap'
  | 'layout_item_missing'
  | 'customer_overlap'
  | 'folio_conflict'
  | 'policy_blocked'

export type BookingConflictSeverity = 'info' | 'warning' | 'blocking'

export type BookingSyncState = 'local' | 'pending_sync' | 'synced' | 'conflict'

export type BookingAvailabilityStatus = 'available' | 'unavailable' | 'conflict' | 'unknown'

export type BookingAvailabilityFilter = {
  itemType?: string
  rowLabel?: string | null
  usageMode?: BookingUsageMode
  includeMaintenance?: boolean
  includeSeasonal?: boolean
}

export type BookingCustomerPayload = {
  fullName?: string
  phone?: string | null
  email?: string | null
  notes?: string | null
}

export type BookingRequestedExtra = {
  catalogItemId?: string | null
  name: string
  quantity: number
}

export type BookingPeriod = {
  id: string
  type: BookingPeriodType
  startDate: string
  endDate?: string | null
  startTime?: string | null
  endTime?: string | null
  label: string
}

export type Booking = {
  id: string
  workspaceId: string
  source: BookingSource
  status: BookingStatus
  customerId?: string | null
  itemId?: string | null
  beachItemId?: string | null
  periodId: string
  folioId?: string | null
  pricingSnapshotId?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  syncState?: BookingSyncState
  remoteId?: string | null
  version?: number
  deviceId?: string | null
  createdBy?: string | null
}

export type BookingRequest = {
  id: string
  workspaceId: string
  source: BookingRequestSource
  customerPayload: BookingCustomerPayload
  requestedPeriod: BookingPeriod
  requestedItemId?: string | null
  requestedItemType?: string | null
  requestedExtras?: BookingRequestedExtra[]
  status: BookingRequestStatus
  pairingStatus: BookingPairingStatus
  convertedBookingId?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  syncState?: BookingSyncState
  remoteId?: string | null
  version?: number
}

export type BookingAssignment = {
  id: string
  bookingId: string
  itemId: string
  assignmentStatus: BookingAssignmentStatus
  createdAt: string
  updatedAt: string
}

export type BookingConflict = {
  id: string
  bookingId?: string | null
  requestId?: string | null
  conflictType: BookingConflictType
  affectedItemIds: string[]
  affectedPeriod: BookingPeriod
  severity: BookingConflictSeverity
  message: string
}

export type CustomerPairingCandidate = {
  id: string
  requestId: string
  existingCustomerId: string
  score: number
  reasons: CustomerPairingReason[]
  decision?: CustomerPairingDecision | null
}

export type PricingSnapshot = {
  id: string
  bookingId: string
  sourceRuleId?: string | null
  catalogItemId: string
  periodType: BookingPeriodType
  scope: string
  basePrice: number
  extrasTotal: number
  includedItems: string[]
  calculatedTotal: number
  manualOverride?: {
    amount: number
    reason?: string | null
    updatedAt: string
  } | null
}

export type FolioLink = {
  bookingId: string
  folioId: string
  status: 'to_prepare' | 'open' | 'partial' | 'paid' | 'cancelled'
}

export type RegistryEventLink = {
  bookingId: string
  registryEventId: string
}

export type AvailabilityQuery = {
  period: BookingPeriod
  itemId?: string | null
  itemType?: string | null
  filters?: BookingAvailabilityFilter
  excludeBookingId?: string | null
}

export type AvailabilityResult = {
  status: BookingAvailabilityStatus
  period: BookingPeriod
  itemId?: string | null
  availableItemIds: string[]
  conflicts: BookingConflict[]
  checkedAt: string
}
