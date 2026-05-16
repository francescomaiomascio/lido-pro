import {
  cancelReservation as cancelReservationRecord,
  checkItemAvailability,
  createReservation as createReservationRecord,
  getActiveReservationsForItem,
  getCurrentReservationForItem,
  getReservationsByDateRange,
  getReservationsForCustomer,
  getReservationsForItem,
  getUpcomingReservationsForItem,
  updateReservation as updateReservationRecord,
} from '../db/reservationRepository'
import type { BeachState } from '../types/db'
import type { Reservation, ReservationInput } from '../types/reservation'
import { loadBeachState } from './beachLayoutService'

export const createReservation = async (input: ReservationInput): Promise<Reservation> => {
  return createReservationRecord(input)
}

export const createReservationAndReload = async (input: ReservationInput): Promise<BeachState> => {
  await createReservationRecord(input)
  return loadBeachState()
}

export const updateReservationAndReload = async (
  reservationId: string,
  input: ReservationInput,
): Promise<BeachState> => {
  await updateReservationRecord(reservationId, input)
  return loadBeachState()
}

export const cancelReservationAndReload = async (
  reservationId: string,
): Promise<BeachState> => {
  await cancelReservationRecord(reservationId)
  return loadBeachState()
}

export {
  checkItemAvailability,
  getActiveReservationsForItem,
  getCurrentReservationForItem,
  getReservationsByDateRange,
  getReservationsForCustomer,
  getReservationsForItem,
  getUpcomingReservationsForItem,
}
