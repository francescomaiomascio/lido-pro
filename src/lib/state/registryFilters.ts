import type { AccountStatus } from '../types/account'
import type { ReservationStatus, ReservationType } from '../types/reservation'

export type RegistryReservationTypeFilter = ReservationType | 'all'
export type RegistryReservationStatusFilter = ReservationStatus | 'all'
export type RegistryAccountStatusFilter = AccountStatus | 'all'

export type RegistryFilters = {
  year: number
  dateFrom: string
  dateTo: string
  customerId: string | null
  customerQuery: string
  itemId: string | null
  itemQuery: string
  reservationType: RegistryReservationTypeFilter
  reservationStatus: RegistryReservationStatusFilter
  accountStatus: RegistryAccountStatusFilter
  onlyOpenBalance: boolean
  onlyPaid: boolean
  onlyActiveReservations: boolean
}

export type OpenRegistryRequest = {
  customerId?: string
  customerName?: string
  itemId?: string
  itemCode?: string
  reservationId?: string
  requestedAt: number
}

export const OPEN_REGISTRY_EVENT = 'beach-bdf:open-registry'

export const getCurrentRegistryYear = (): number => new Date().getFullYear()

export const createDefaultRegistryFilters = (): RegistryFilters => ({
  year: getCurrentRegistryYear(),
  dateFrom: '',
  dateTo: '',
  customerId: null,
  customerQuery: '',
  itemId: null,
  itemQuery: '',
  reservationType: 'all',
  reservationStatus: 'all',
  accountStatus: 'all',
  onlyOpenBalance: false,
  onlyPaid: false,
  onlyActiveReservations: false,
})

export const requestOpenRegistry = (detail: Omit<OpenRegistryRequest, 'requestedAt'> = {}) => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent<OpenRegistryRequest>(OPEN_REGISTRY_EVENT, {
      detail: {
        ...detail,
        requestedAt: Date.now(),
      },
    }),
  )
}
