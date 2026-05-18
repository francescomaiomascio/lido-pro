import type { AvailabilityLockRecord, BookingConflictInput, BookingConflictRecord } from './bookingPersistence.types'
import type { AvailabilityConflict, AvailabilityPeriod, AvailabilityQuery } from './availability.types'
import { normalizeAvailabilityPeriod } from './availabilityDate'
import { getBeachDatabase } from '../db/database'
import type { BeachItem } from '../types/beach'
import type { Reservation } from '../types/reservation'

export type AvailabilityRepositoryScope = {
  itemIds?: string[]
  period?: AvailabilityPeriod
  excludeReservationId?: string | null
}

export const getItemsForAvailability = async (query: AvailabilityQuery): Promise<BeachItem[]> => {
  const db = getBeachDatabase()
  const layout = await db.getActiveLayout()
  const items = await db.getBeachItems(layout.id)
  const filters = query.filters ?? {}

  return items.filter((item) => {
    if (!item.active) return false
    if (filters.itemId && item.id !== filters.itemId) return false
    if (filters.itemType && item.type !== filters.itemType) return false
    if (filters.itemKind && item.type !== filters.itemKind) return false
    if (filters.rowKey && item.rowLabel !== filters.rowKey) return false
    if (filters.status && item.status !== filters.status) return false
    return true
  })
}

export const getReservationsForAvailability = async (
  query: AvailabilityQuery,
): Promise<Reservation[]> => {
  const normalized = normalizeAvailabilityPeriod(query.period)
  const reservations = await getBeachDatabase().getReservationsByDateRange(
    normalized.startDate,
    normalized.endDate ?? normalized.startDate,
  )
  const filters = query.filters ?? {}

  return reservations.filter((reservation) => {
    if (query.excludeReservationId && reservation.id === query.excludeReservationId) return false
    if (filters.itemId && reservation.itemId !== filters.itemId) return false
    if (filters.customerId && reservation.customerId !== filters.customerId) return false
    return true
  })
}

export const getLocksForAvailability = async (
  query: AvailabilityQuery,
): Promise<AvailabilityLockRecord[]> => {
  if (query.filters?.includeLocks === false) {
    return []
  }

  const locks = await getBeachDatabase().listAvailabilityLocks({
    itemId: query.filters?.itemId ?? undefined,
    status: 'active',
  })
  const now = new Date()

  return locks.filter((lock) => {
    if (query.excludeRequestId && lock.requestId === query.excludeRequestId) return false
    if (query.excludeReservationId && lock.reservationId === query.excludeReservationId) return false
    if (lock.expiresAt && new Date(lock.expiresAt).getTime() <= now.getTime()) return false
    return true
  })
}

export const saveAvailabilityConflict = async (
  conflict: AvailabilityConflict,
): Promise<BookingConflictRecord> => {
  const input: BookingConflictInput = {
    reservationId: conflict.reservationId ?? null,
    conflictType: conflict.type,
    severity: conflict.severity,
    affectedItemIds: conflict.itemId ? [conflict.itemId] : [],
    affectedPeriod: {
      id: `${conflict.type}-${conflict.itemId ?? 'item'}-${conflict.period.startDate}`,
      type: conflict.period.type,
      startDate: conflict.period.startDate,
      endDate: conflict.period.endDate ?? conflict.period.startDate,
      startTime: conflict.period.startTime ?? null,
      endTime: conflict.period.endTime ?? null,
      label: conflict.period.label ?? conflict.period.startDate,
    },
    message: conflict.message,
  }
  return getBeachDatabase().createBookingConflict(input)
}

export const clearResolvedAvailabilityConflicts = async (
  scope: AvailabilityRepositoryScope,
): Promise<BookingConflictRecord[]> => {
  const conflicts = await getBeachDatabase().listBookingConflicts({ status: 'open' })
  const scoped = conflicts.filter((conflict) => {
    if (scope.itemIds?.length && !conflict.affectedItemIds.some((id) => scope.itemIds?.includes(id))) {
      return false
    }
    return true
  })
  const resolved: BookingConflictRecord[] = []
  for (const conflict of scoped) {
    resolved.push(await getBeachDatabase().resolveBookingConflict(conflict.id))
  }
  return resolved
}
