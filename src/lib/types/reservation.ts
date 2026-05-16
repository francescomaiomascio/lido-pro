export type ReservationType = 'daily' | 'seasonal'
export type ReservationStatus = 'draft' | 'active' | 'completed' | 'cancelled'

export interface Reservation {
  id: string
  itemId: string
  customerId: string
  assignmentId?: string | null
  accountId?: string | null
  reservationType: ReservationType
  startDate: string
  endDate: string
  status: ReservationStatus
  title?: string | null
  notes?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  cancelledAt?: string | null
}

export interface ReservationInput {
  itemId: string
  customerId: string
  assignmentId?: string | null
  accountId?: string | null
  reservationType: ReservationType
  startDate: string
  endDate: string
  title?: string | null
  notes?: string | null
}
