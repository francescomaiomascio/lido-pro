import type { AccountStatus } from './account'
import type { BeachItemType } from './beach'
import type { ReservationStatus, ReservationType } from './reservation'

export type RegistryRecordKind = 'reservation' | 'account'

export type RegistryRecord = {
  id: string
  kind: RegistryRecordKind
  reservationId: string | null
  accountId: string | null
  customerId: string
  itemId: string
  customerName: string
  customerPhone: string | null
  itemCode: string
  itemType: BeachItemType | null
  reservationType: ReservationType | null
  reservationStatus: ReservationStatus | null
  startDate: string | null
  endDate: string | null
  accountStatus: AccountStatus | null
  totalAmountCents: number
  paidAmountCents: number
  balanceAmountCents: number
  paymentCount: number
  lastPaymentDate: string | null
  extrasSummary: string
  notes: string | null
}

export type RegistrySummary = {
  totalReservations: number
  totalCustomers: number
  totalDueCents: number
  totalPaidCents: number
  totalBalanceCents: number
  openAccounts: number
  paidAccounts: number
  partialAccounts: number
}
