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
import { loadActiveOperationalBeachState } from './beachLayoutService'

export const createReservation = async (input: ReservationInput): Promise<Reservation> => {
  return createReservationRecord(input)
}

export const createReservationAndReload = async (input: ReservationInput): Promise<BeachState> => {
  await createReservationRecord(input)
  return loadActiveOperationalBeachState()
}

export const updateReservationAndReload = async (
  reservationId: string,
  input: ReservationInput,
): Promise<BeachState> => {
  await updateReservationRecord(reservationId, input)
  return loadActiveOperationalBeachState()
}

export const cancelReservationAndReload = async (
  reservationId: string,
): Promise<BeachState> => {
  await cancelReservationRecord(reservationId)
  return loadActiveOperationalBeachState()
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
