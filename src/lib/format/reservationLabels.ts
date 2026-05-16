import type { ReservationStatus, ReservationType } from '../types/reservation'

export const reservationTypeLabels: Record<ReservationType, string> = {
  daily: 'Giornaliero',
  seasonal: 'Stagionale',
}

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  draft: 'Bozza',
  active: 'Attiva',
  completed: 'Completata',
  cancelled: 'Annullata',
}
