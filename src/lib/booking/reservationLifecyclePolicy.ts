import type { Reservation } from '../types/reservation'
import type { BookingUsageMode } from './bookingDomain.types'
import type { ReservationLifecycleStatus } from './reservationLifecycle.types'

export const reservationStatusToLifecycleStatus = (
  status: Reservation['status'],
): ReservationLifecycleStatus => {
  if (status === 'draft') return 'draft'
  if (status === 'active') return 'active'
  if (status === 'completed') return 'completed'
  return 'cancelled'
}

const finalStatuses: ReservationLifecycleStatus[] = [
  'completed',
  'cancelled',
  'rejected',
  'expired',
  'archived',
]

export const canEditReservation = (reservation: Reservation): boolean =>
  !finalStatuses.includes(reservationStatusToLifecycleStatus(reservation.status))

export const canChangePeriod = (reservation: Reservation): boolean =>
  canEditReservation(reservation)

export const canChangeCustomer = (reservation: Reservation): boolean =>
  canEditReservation(reservation) && reservation.status !== 'completed'

export const canChangeItem = (reservation: Reservation): boolean =>
  canEditReservation(reservation)

export const canCancelReservation = (reservation: Reservation): boolean =>
  !['cancelled', 'completed'].includes(reservation.status)

export const canCompleteReservation = (reservation: Reservation): boolean =>
  reservation.active && reservation.status === 'active'

export const canRequestClientChange = (reservation: Reservation, mode: BookingUsageMode): boolean =>
  (mode === 'client_web' || mode === 'client_app') && canEditReservation(reservation)

export const canApplyClientChange = (input: {
  reservation: Reservation
  mode: BookingUsageMode
  changeRequestAccepted?: boolean
}): boolean =>
  input.mode === 'operator_app' &&
  input.changeRequestAccepted === true &&
  canEditReservation(input.reservation)

export const isBookingVisibleToClient = (reservation: Reservation): boolean =>
  reservation.active || reservation.status === 'cancelled' || reservation.status === 'completed'
