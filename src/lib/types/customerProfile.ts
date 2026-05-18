import type { Account, Payment } from './account'
import type { BeachItem } from './beach'
import type { BeachItemCustomerAssignment, Customer } from './customer'
import type { AccountExtraItem } from './extraItem'
import type { Reservation, ReservationStatus, ReservationType } from './reservation'

export type CustomerAccountSummary = {
  totalAccounts: number
  openAccounts: number
  paidAccounts: number
  totalAmountCents: number
  paidAmountCents: number
  balanceAmountCents: number
}

export type CustomerReservationSummary = {
  reservationId: string
  type: ReservationType
  status: ReservationStatus
  startDate: string
  endDate: string
  itemCode: string
  itemType: BeachItem['type']
  accountStatus: Account['status'] | null
  totalAmountCents: number
  paidAmountCents: number
  balanceAmountCents: number
  extrasSummary: string
}

export type CustomerPaymentSummary = Payment & {
  itemCode: string | null
  reservationId: string | null
  accountStatus: Account['status'] | null
}

export type CustomerCurrentActivity = {
  assignment: BeachItemCustomerAssignment | null
  reservation: Reservation | null
  beachItem: BeachItem | null
  account: Account | null
}

export type CustomerTotals = {
  reservations: number
  payments: number
  extrasAmountCents: number
}

export type CustomerProfile = {
  customer: Customer
  currentAssignment: BeachItemCustomerAssignment | null
  currentReservation: Reservation | null
  currentBeachItem: BeachItem | null
  currentAccount: Account | null
  accountSummary: CustomerAccountSummary
  recentReservations: CustomerReservationSummary[]
  recentPayments: CustomerPaymentSummary[]
  totals: CustomerTotals
}

export type CustomerSearchSummary = {
  customer: Customer
  currentActivityLabel: string
  currentPlaceLabel: string | null
  status: 'active' | 'no-active-reservation' | 'open-balance'
  hasActiveReservation: boolean
  hasActiveAssignment: boolean
  hasOpenAccount: boolean
  balanceAmountCents: number
}
