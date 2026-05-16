import type { Account, AccountStatus, Payment, PaymentMethod } from './account'
import type { BeachItem } from './beach'
import type { Customer } from './customer'
import type { AccountExtraItem } from './extraItem'
import type { Reservation, ReservationStatus, ReservationType } from './reservation'
import type { PriceSuggestion } from './tariff'

export type LedgerPaymentRow = {
  id: string
  amountCents: number
  paidAt: string
  method: PaymentMethod
  note?: string | null
}

export type LedgerExtraRow = {
  id: string
  name: string
  quantity: number
  unitAmountCents: number
  totalAmountCents: number
  note?: string | null
  includedState: 'not-modeled'
}

export type ReservationTimelineEntry = {
  id: string
  label: string
  date: string
  detail?: string
  tone: 'neutral' | 'positive' | 'warning'
}

export type AccountLedger = {
  account: Account
  customer: Customer | null
  reservation: Reservation | null
  item: BeachItem | null
  baseAmountCents: number
  extrasAmountCents: number
  totalAmountCents: number
  paidAmountCents: number
  balanceAmountCents: number
  payments: Payment[]
  paymentRows: LedgerPaymentRow[]
  extras: AccountExtraItem[]
  extraRows: LedgerExtraRow[]
  accountStatus: AccountStatus
}

export type ReservationSummary = {
  reservation: Reservation
  customer: Customer | null
  beachItem: BeachItem | null
  account: Account | null
  payments: Payment[]
  extras: AccountExtraItem[]
  tariffSuggestion: PriceSuggestion | null
  ledger: AccountLedger | null
  reservationId: string
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
  itemCode: string
  itemType: BeachItem['type'] | null
  reservationType: ReservationType
  reservationStatus: ReservationStatus
  startDate: string
  endDate: string
  accountStatus: AccountStatus | null
  totalAmountCents: number
  paidAmountCents: number
  balanceAmountCents: number
  paymentCount: number
  lastPaymentDate: string | null
  extrasSummary: string
  includedItemsSummary: string
  timeline: ReservationTimelineEntry[]
}
