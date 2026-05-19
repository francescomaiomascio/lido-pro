import type { Account } from '../types/account'
import type { BeachItem, BeachItemType } from '../types/beach'
import type { Reservation } from '../types/reservation'
import type { AvailabilityResult, ConfirmabilityResult } from './availability.types'
import type { BookingSource, BookingStatus, BookingUsageMode } from './bookingDomain.types'
import type { BookingAccountImpactPreview } from './bookingAccountImpact.types'
import type { NormalizedBookingPeriod } from './bookingPeriod.types'
import type { BookingChangeRequestRecord } from './bookingPersistence.types'

export type ReservationLifecycleStatus = BookingStatus

export type ReservationLifecycleEventType =
  | 'reservation_created'
  | 'reservation_confirmed'
  | 'reservation_period_changed'
  | 'reservation_item_changed'
  | 'reservation_customer_changed'
  | 'reservation_cancelled'
  | 'reservation_completed'
  | 'client_change_requested'
  | 'client_change_accepted'
  | 'client_change_rejected'
  | 'account_impact_created'
  | 'payment_recorded'
  | 'refund_or_credit_required'

export type BookingChangeRequestType =
  | 'change_period'
  | 'change_item'
  | 'cancel_booking'
  | 'add_service'
  | 'remove_service'
  | 'payment_update'
  | 'note_update'

export type BookingChangeRequestStatus =
  | 'draft'
  | 'requested'
  | 'pending_operator_review'
  | 'accepted'
  | 'rejected'
  | 'applied'
  | 'cancelled'

export type ReservationLifecycleContext = {
  reservation: Reservation
  canonicalStatus: ReservationLifecycleStatus
  account: Account | null
}

export type ReservationPeriodChangeProposal = {
  allowed: boolean
  mode: BookingUsageMode
  reservation: Reservation
  currentPeriod: NormalizedBookingPeriod
  proposedPeriod: NormalizedBookingPeriod
  availability: AvailabilityResult | null
  confirmability: ConfirmabilityResult | null
  accountImpact: BookingAccountImpactPreview
  changeRequest: BookingChangeRequestRecord | null
  reason?: string | null
}

export type ReservationCancellationProposal = {
  allowed: boolean
  mode: BookingUsageMode
  reservation: Reservation
  accountImpact: BookingAccountImpactPreview
  changeRequest: BookingChangeRequestRecord | null
  reason?: string | null
}

export type ClientBookingProjection = {
  reservationId: string
  status: ReservationLifecycleStatus
  customerVisibleStatus: 'requested' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'pending_change' | 'needs_review'
  period: NormalizedBookingPeriod
  itemSummary: {
    itemId: string
    code: string
    type: BeachItemType
    rowLabel: string
    numberIndex: number
  } | null
  folioSummary: {
    accountId: string
    status: Account['status']
    totalAmountCents: number
    paidAmountCents: number
    balanceAmountCents: number
  } | null
  paymentsSummary: {
    paidAmountCents: number
    balanceAmountCents: number
  }
  lastUpdatedAt: string
  pendingChangeRequest?: BookingChangeRequestRecord | null
}

export type ReservationLifecycleMutationSource = {
  source: BookingSource
  actorId?: string | null
  mode: BookingUsageMode
}

export type ReservationLifecycleLoadedItem = Pick<
  BeachItem,
  'id' | 'code' | 'type' | 'rowLabel' | 'numberIndex'
>
