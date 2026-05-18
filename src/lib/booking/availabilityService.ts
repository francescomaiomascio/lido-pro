import type { BeachItem } from '../types/beach'
import type { Reservation, ReservationStatus } from '../types/reservation'
import type { AvailabilityLockRecord } from './bookingPersistence.types'
import {
  getItemsForAvailability,
  getLocksForAvailability,
  getReservationsForAvailability,
  saveAvailabilityConflict,
} from './availabilityRepository'
import {
  isValidAvailabilityPeriod,
  normalizeAvailabilityPeriod,
  periodsOverlap,
} from './availabilityDate'
import type {
  AvailabilityConflict,
  AvailabilityPeriod,
  AvailabilityQuery,
  AvailabilityReservationDraft,
  AvailabilityResult,
  ConfirmabilityResult,
  ItemAvailability,
} from './availability.types'

export const BLOCKING_RESERVATION_STATUSES: ReservationStatus[] = ['active']
export const NON_BLOCKING_RESERVATION_STATUSES: ReservationStatus[] = ['draft', 'cancelled', 'completed']

export type CheckItemAvailabilityInput = {
  itemId: string
  period: AvailabilityPeriod
  excludeReservationId?: string | null
  excludeRequestId?: string | null
  mode?: AvailabilityQuery['mode']
  includeMaintenance?: boolean
  includeLocks?: boolean
}

export type AvailabilityCollectionInput = {
  period: AvailabilityPeriod
  filters?: AvailabilityQuery['filters']
  excludeReservationId?: string | null
  excludeRequestId?: string | null
  mode?: AvailabilityQuery['mode']
}

export type DetectBookingConflictsInput = {
  draft: AvailabilityReservationDraft
  persist?: boolean
}

const reservationToPeriod = (reservation: Reservation): AvailabilityPeriod =>
  normalizeAvailabilityPeriod({
    type: reservation.reservationType,
    startDate: reservation.startDate,
    endDate: reservation.endDate,
    label: reservation.reservationType,
  })

const isBlockingReservation = (reservation: Reservation): boolean =>
  reservation.active && BLOCKING_RESERVATION_STATUSES.includes(reservation.status)

const isActiveLock = (lock: AvailabilityLockRecord): boolean => {
  if (lock.status !== 'active') {
    return false
  }
  if (!lock.expiresAt) {
    return true
  }
  return new Date(lock.expiresAt).getTime() > Date.now()
}

const buildQuery = (input: AvailabilityCollectionInput): AvailabilityQuery => ({
  period: normalizeAvailabilityPeriod(input.period),
  filters: input.filters,
  excludeReservationId: input.excludeReservationId,
  excludeRequestId: input.excludeRequestId,
  mode: input.mode ?? 'operator_app',
})

const buildInvalidPeriodConflict = (period: AvailabilityPeriod): AvailabilityConflict => ({
  type: 'invalid_period',
  severity: 'blocking',
  message: 'Invalid availability period.',
  period,
})

const buildMissingItemConflict = (itemId: string, period: AvailabilityPeriod): AvailabilityConflict => ({
  type: 'missing_item',
  severity: 'blocking',
  itemId,
  message: 'Item does not exist in the active layout.',
  period,
})

const buildMaintenanceConflict = (item: BeachItem, period: AvailabilityPeriod): AvailabilityConflict => ({
  type: 'maintenance',
  severity: 'blocking',
  itemId: item.id,
  message: 'Item is in maintenance.',
  period,
})

const buildReservationConflict = (
  reservation: Reservation,
  period: AvailabilityPeriod,
): AvailabilityConflict => ({
  type: 'overlapping_reservation',
  severity: isBlockingReservation(reservation) ? 'blocking' : 'warning',
  itemId: reservation.itemId,
  reservationId: reservation.id,
  message: isBlockingReservation(reservation)
    ? 'Period overlaps an active reservation.'
    : 'Period overlaps a non-blocking reservation draft.',
  period,
})

const buildLockConflict = (
  lock: AvailabilityLockRecord,
  period: AvailabilityPeriod,
): AvailabilityConflict => ({
  type: 'active_lock',
  severity: 'blocking',
  itemId: lock.itemId,
  lockId: lock.id,
  message: 'Period overlaps an active availability lock.',
  period,
})

const evaluateItem = (
  item: BeachItem,
  period: AvailabilityPeriod,
  reservations: Reservation[],
  locks: AvailabilityLockRecord[],
  includeMaintenance: boolean,
): ItemAvailability => {
  const conflicts: AvailabilityConflict[] = []

  if (item.status === 'maintenance' && !includeMaintenance) {
    conflicts.push(buildMaintenanceConflict(item, period))
  }

  for (const reservation of reservations) {
    if (reservation.itemId !== item.id) continue
    if (!periodsOverlap(reservationToPeriod(reservation), period)) continue
    const conflict = buildReservationConflict(reservation, period)
    if (conflict.severity === 'blocking' || conflict.severity === 'warning') {
      conflicts.push(conflict)
    }
  }

  for (const lock of locks) {
    if (lock.itemId !== item.id) continue
    if (!isActiveLock(lock)) continue
    if (!periodsOverlap(lock.period, period)) continue
    conflicts.push(buildLockConflict(lock, period))
  }

  const blocking = conflicts.filter((conflict) => conflict.severity === 'blocking')
  const warnings = conflicts.filter((conflict) => conflict.severity === 'warning')

  return {
    itemId: item.id,
    available: blocking.length === 0,
    blockedByReservations: blocking
      .map((conflict) => conflict.reservationId)
      .filter((id): id is string => Boolean(id)),
    blockedByLocks: blocking
      .map((conflict) => conflict.lockId)
      .filter((id): id is string => Boolean(id)),
    conflicts,
    reason: blocking[0]?.message ?? warnings[0]?.message ?? null,
    status: blocking.length > 0 ? 'unavailable' : warnings.length > 0 ? 'warning' : 'available',
  }
}

export const getAvailabilityForRange = async (
  input: AvailabilityCollectionInput,
): Promise<AvailabilityResult> => {
  const query = buildQuery(input)
  const period = normalizeAvailabilityPeriod(query.period)

  if (!isValidAvailabilityPeriod(period)) {
    const conflict = buildInvalidPeriodConflict(period)
    return {
      period,
      total: 0,
      available: 0,
      unavailable: 0,
      items: [],
      conflicts: [conflict],
    }
  }

  const [items, reservations, locks] = await Promise.all([
    getItemsForAvailability(query),
    getReservationsForAvailability(query),
    getLocksForAvailability(query),
  ])

  const itemResults = items.map((item) =>
    evaluateItem(
      item,
      period,
      reservations,
      locks,
      query.filters?.includeMaintenance === true,
    ),
  )
  const conflicts = itemResults.flatMap((item) => item.conflicts)

  return {
    period,
    total: itemResults.length,
    available: itemResults.filter((item) => item.available).length,
    unavailable: itemResults.filter((item) => !item.available).length,
    items: itemResults,
    conflicts,
  }
}

export const getAvailabilityForDate = async (
  input: Omit<AvailabilityCollectionInput, 'period'> & {
    date: string
  },
): Promise<AvailabilityResult> => {
  return getAvailabilityForRange({
    ...input,
    period: {
      type: 'daily',
      startDate: input.date,
      endDate: input.date,
      label: input.date,
    },
  })
}

export const getAvailableItems = async (
  input: AvailabilityCollectionInput,
): Promise<ItemAvailability[]> => {
  const result = await getAvailabilityForRange(input)
  return result.items.filter((item) => item.available)
}

export const checkItemAvailability = async (
  input: CheckItemAvailabilityInput,
): Promise<ItemAvailability> => {
  const period = normalizeAvailabilityPeriod(input.period)
  const result = await getAvailabilityForRange({
    period,
    filters: {
      itemId: input.itemId,
      includeMaintenance: input.includeMaintenance,
      includeLocks: input.includeLocks,
    },
    excludeReservationId: input.excludeReservationId,
    excludeRequestId: input.excludeRequestId,
    mode: input.mode ?? 'operator_app',
  })

  return result.items[0] ?? {
    itemId: input.itemId,
    available: false,
    blockedByReservations: [],
    blockedByLocks: [],
    conflicts: [buildMissingItemConflict(input.itemId, period)],
    reason: 'Item does not exist in the active layout.',
    status: 'unavailable',
  }
}

export const explainAvailability = checkItemAvailability

export const detectBookingConflicts = async (
  input: DetectBookingConflictsInput,
): Promise<AvailabilityConflict[]> => {
  const draft = input.draft
  const period = normalizeAvailabilityPeriod(draft.period)
  const conflicts: AvailabilityConflict[] = []

  if (!draft.itemId) {
    conflicts.push(buildMissingItemConflict('', period))
  } else {
    const availability = await checkItemAvailability({
      itemId: draft.itemId,
      period,
      excludeReservationId: draft.id,
      mode: draft.mode ?? 'operator_app',
    })
    conflicts.push(...availability.conflicts)
  }

  if (input.persist) {
    for (const conflict of conflicts.filter((conflict) => conflict.severity === 'blocking')) {
      await saveAvailabilityConflict(conflict)
    }
  }

  return conflicts
}

export const canConfirmBooking = async (
  draft: AvailabilityReservationDraft & {
    persistConflicts?: boolean
  },
): Promise<ConfirmabilityResult> => {
  const conflicts = await detectBookingConflicts({
    draft,
    persist: draft.persistConflicts,
  })
  const blocking = conflicts.filter((conflict) => conflict.severity === 'blocking')
  const warnings = conflicts.filter((conflict) => conflict.severity === 'warning')
  const requiredActions = blocking.map((conflict) => conflict.message)

  return {
    canConfirm: blocking.length === 0,
    conflicts: blocking,
    warnings,
    requiredActions,
  }
}
