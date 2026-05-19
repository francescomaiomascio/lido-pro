export type RegistryEventSource =
  | 'booking'
  | 'booking_request'
  | 'reservation_lifecycle'
  | 'folio'
  | 'payment'
  | 'articoli'
  | 'servizi'
  | 'staff'
  | 'studio'
  | 'system'
  | 'operator'

export type RegistryEventType =
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_period_changed'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'booking_change_requested'
  | 'booking_change_accepted'
  | 'booking_change_rejected'
  | 'customer_paired'
  | 'folio_created'
  | 'folio_updated'
  | 'folio_manual_review_required'
  | 'payment_recorded'
  | 'credit_or_refund_required'
  | 'pricing_snapshot_created'
  | 'pricing_reprice_required'
  | 'availability_conflict_detected'

export type RegistryEventSeverity = 'info' | 'success' | 'warning' | 'critical'

export type RegistryEventStatus = 'active' | 'acknowledged' | 'resolved' | 'voided'

export type RegistryEventLinks = {
  entityType?: string | null
  entityId?: string | null
  reservationId?: string | null
  requestId?: string | null
  customerId?: string | null
  accountId?: string | null
  paymentId?: string | null
  itemId?: string | null
  pricingSnapshotId?: string | null
}

export type RegistryEvent = RegistryEventLinks & {
  id: string
  workspaceId?: string | null
  source: RegistryEventSource
  type: RegistryEventType
  severity: RegistryEventSeverity
  status: RegistryEventStatus
  title: string
  description?: string | null
  amountCents?: number | null
  payload?: Record<string, unknown> | null
  dedupeKey?: string | null
  createdAt: string
  createdBy?: string | null
  deviceId?: string | null
}

export type RegistryEventInput = {
  workspaceId?: string | null
  source: RegistryEventSource
  type: RegistryEventType
  severity?: RegistryEventSeverity
  title: string
  description?: string | null
  links?: RegistryEventLinks
  amountCents?: number | null
  payload?: Record<string, unknown> | null
  dedupeKey?: string | null
  createdAt?: string
  createdBy?: string | null
  deviceId?: string | null
}

export type RegistryEventFilter = {
  source?: RegistryEventSource
  type?: RegistryEventType
  status?: RegistryEventStatus
  reservationId?: string
  requestId?: string
  customerId?: string
  accountId?: string
  itemId?: string
  limit?: number
}
