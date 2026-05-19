import type { Account } from '../types/account'
import type { NormalizedBookingPeriod } from './bookingPeriod.types'

export type BookingAccountImpactStatus =
  | 'unchanged'
  | 'recalculate_needed'
  | 'residual_changed'
  | 'credit_required'
  | 'refund_required'
  | 'manual_review_required'
  | 'no_account'
  | 'no_payment_no_balance'
  | 'residual_to_cancel'

export type BookingAccountImpactPreview = {
  status: BookingAccountImpactStatus
  account: Account | null
  oldPeriod?: NormalizedBookingPeriod | null
  newPeriod?: NormalizedBookingPeriod | null
  totalAmountCents: number
  paidAmountCents: number
  balanceAmountCents: number
  reason: string
  destructiveWriteAllowed: false
}
