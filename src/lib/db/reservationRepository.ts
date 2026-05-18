import { getBeachDatabase } from './database'
import type { Reservation, ReservationInput } from '../types/reservation'
import { checkItemAvailability as checkCanonicalItemAvailability } from '../booking/availabilityService'

export const createReservation = async (input: ReservationInput): Promise<Reservation> => {
  return getBeachDatabase().createReservation(input)
}

export const updateReservation = async (
  reservationId: string,
  input: ReservationInput,
): Promise<Reservation> => {
  return getBeachDatabase().updateReservation(reservationId, input)
}

export const cancelReservation = async (reservationId: string): Promise<Reservation> => {
  return getBeachDatabase().cancelReservation(reservationId)
}

export const getReservation = async (reservationId: string): Promise<Reservation | null> => {
  return getBeachDatabase().getReservation(reservationId)
}

export const getReservationsForItem = async (itemId: string): Promise<Reservation[]> => {
  return getBeachDatabase().getReservationsForItem(itemId)
}

export const getActiveReservationsForItem = async (itemId: string): Promise<Reservation[]> => {
  return getBeachDatabase().getActiveReservationsForItem(itemId)
}

export const getReservationsForCustomer = async (customerId: string): Promise<Reservation[]> => {
  return getBeachDatabase().getReservationsForCustomer(customerId)
}

export const getReservationsByDateRange = async (
  startDate: string,
  endDate: string,
): Promise<Reservation[]> => {
  return getBeachDatabase().getReservationsByDateRange(startDate, endDate)
}

export const checkItemAvailability = async (
  itemId: string,
  startDate: string,
  endDate: string,
  excludeReservationId?: string,
): Promise<boolean> => {
  const result = await checkCanonicalItemAvailability({
    itemId,
    period: {
      type: startDate === endDate ? 'daily' : 'multi_day',
      startDate,
      endDate,
      label: startDate === endDate ? startDate : `${startDate} - ${endDate}`,
    },
    excludeReservationId,
    mode: 'operator_app',
  })
  return result.available
}

export const getCurrentReservationForItem = async (
  itemId: string,
  date?: string,
): Promise<Reservation | null> => {
  return getBeachDatabase().getCurrentReservationForItem(itemId, date)
}

export const getUpcomingReservationsForItem = async (
  itemId: string,
  limit?: number,
): Promise<Reservation[]> => {
  return getBeachDatabase().getUpcomingReservationsForItem(itemId, limit)
}
