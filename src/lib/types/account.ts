export type AccountType = 'daily' | 'seasonal'
export type AccountStatus = 'open' | 'partial' | 'paid' | 'cancelled'
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other'

export type AccountInput = {
  itemId: string
  customerId: string
  assignmentId?: string | null
  accountType: AccountType
  seasonLabel?: string | null
  totalAmountCents: number
  notes?: string | null
}

export interface Account {
  id: string
  itemId: string
  customerId: string
  assignmentId?: string | null
  accountType: AccountType
  seasonLabel?: string | null
  baseAmountCents: number
  extrasAmountCents: number
  totalAmountCents: number
  paidAmountCents: number
  balanceAmountCents: number
  status: AccountStatus
  notes?: string | null
  active: boolean
  openedAt: string
  closedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  accountId: string
  amountCents: number
  paymentMethod: PaymentMethod
  paidAt: string
  note?: string | null
  createdAt: string
}

export type PaymentScheduleType = 'manual' | 'monthly' | 'custom'
export type PaymentInstallmentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'

export interface PaymentSchedule {
  id: string
  accountId: string
  scheduleType: PaymentScheduleType
  totalInstallments: number
  active: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface PaymentScheduleInput {
  accountId: string
  scheduleType?: PaymentScheduleType
  totalInstallments?: number
  notes?: string | null
}

export interface PaymentInstallment {
  id: string
  scheduleId: string
  accountId: string
  dueDate: string
  expectedAmountCents: number
  paidAmountCents: number
  status: PaymentInstallmentStatus
  createdAt: string
  updatedAt: string
}
