import type { BeachItemStatus } from '../types/beach'
import type { BookingUsageMode } from './bookingDomain.types'

export type AvailabilityPeriodType = 'daily' | 'multi_day' | 'seasonal' | 'custom'

export type AvailabilityPeriod = {
  type: AvailabilityPeriodType
  startDate: string
  endDate?: string | null
  startTime?: string | null
  endTime?: string | null
  label?: string | null
}

export type AvailabilityFilter = {
  itemId?: string | null
  itemType?: string | null
  itemKind?: string | null
  rowKey?: string | null
  zoneId?: string | null
  status?: BeachItemStatus | null
  customerId?: string | null
  includeMaintenance?: boolean
  includeLocks?: boolean
}

export type AvailabilityQuery = {
  workspaceId?: string | null
  period: AvailabilityPeriod
  filters?: AvailabilityFilter
  excludeReservationId?: string | null
  excludeRequestId?: string | null
  mode: BookingUsageMode
}

export type AvailabilityConflictType =
  | 'overlapping_reservation'
  | 'active_lock'
  | 'item_unavailable'
  | 'maintenance'
  | 'invalid_period'
  | 'missing_item'

export type AvailabilityConflictSeverity = 'info' | 'warning' | 'blocking'

export type AvailabilityConflict = {
  id?: string
  type: AvailabilityConflictType
  severity: AvailabilityConflictSeverity
  itemId?: string | null
  reservationId?: string | null
  lockId?: string | null
  message: string
  period: AvailabilityPeriod
}

export type ItemAvailabilityStatus = 'available' | 'unavailable' | 'warning' | 'unknown'

export type ItemAvailability = {
  itemId: string
  available: boolean
  blockedByReservations: string[]
  blockedByLocks: string[]
  conflicts: AvailabilityConflict[]
  reason?: string | null
  status: ItemAvailabilityStatus
}

export type AvailabilityResult = {
  period: AvailabilityPeriod
  total: number
  available: number
  unavailable: number
  items: ItemAvailability[]
  conflicts: AvailabilityConflict[]
}

export type ConfirmabilityResult = {
  canConfirm: boolean
  conflicts: AvailabilityConflict[]
  warnings: AvailabilityConflict[]
  requiredActions: string[]
}

export type AvailabilityReservationDraft = {
  id?: string | null
  itemId?: string | null
  customerId?: string | null
  period: AvailabilityPeriod
  mode?: BookingUsageMode
}
