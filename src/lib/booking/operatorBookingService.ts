import { getReservation, updateReservation } from '../db/reservationRepository'
import type { SavePeriodAndEnsureAccountInput, SavePeriodAndEnsureAccountResult } from '../services/bookingFlowService'
import { savePeriodAndEnsureAccount } from '../services/bookingFlowService'
import { cancelReservationAndReload } from '../services/reservationService'
import { loadBeachState } from '../services/beachLayoutService'
import type { Account } from '../types/account'
import type { BeachItem } from '../types/beach'
import type { BeachItemAssignedCustomer } from '../types/customer'
import type { BeachState } from '../types/db'
import type { Reservation, ReservationInput, ReservationType } from '../types/reservation'
import type { PriceSuggestion } from '../types/tariff'
import type { AvailabilityPeriod, ConfirmabilityResult, ItemAvailability } from './availability.types'
import { canConfirmBooking, checkItemAvailability, detectBookingConflicts } from './availabilityService'

export type OperatorBookingErrorCode =
  | 'missing_item'
  | 'missing_customer'
  | 'missing_period'
  | 'unavailable_period'
  | 'pricing_unavailable'
  | 'account_link_failed'
  | 'reservation_save_failed'

export class OperatorBookingError extends Error {
  code: OperatorBookingErrorCode

  constructor(code: OperatorBookingErrorCode, message: string) {
    super(message)
    this.name = 'OperatorBookingError'
    this.code = code
  }
}

export type OperatorBookingDraftInput = {
  item?: BeachItem | null
  assignedCustomer?: BeachItemAssignedCustomer | null
  reservationId?: string | null
  reservationType?: ReservationType | null
  startDate?: string | null
  endDate?: string | null
}

export type OperatorBookingValidationResult = {
  valid: boolean
  errors: OperatorBookingErrorCode[]
  availability: ItemAvailability | null
  confirmability: ConfirmabilityResult | null
}

export type OperatorBookingPreparation = {
  item: BeachItem | null
  assignedCustomer: BeachItemAssignedCustomer | null
  reservation: Reservation | null
  priceSuggestion: PriceSuggestion | null
  account: Account | null
  availability: ItemAvailability | null
  confirmability: ConfirmabilityResult | null
  accountStatus: 'missing' | 'open' | 'partial' | 'paid' | 'cancelled'
}

export type OperatorBookingConfirmInput = Omit<
  SavePeriodAndEnsureAccountInput,
  'item' | 'assignedCustomer'
> & {
  item: BeachItem
  assignedCustomer: BeachItemAssignedCustomer
}

export type OperatorBookingResult = SavePeriodAndEnsureAccountResult & {
  availability: ItemAvailability
  confirmability: ConfirmabilityResult
  registryEventIntent: {
    type: 'operator_booking_confirmed' | 'operator_booking_updated'
    reservationId: string
    itemId: string
    customerId: string
  }
}

export type OperatorBookingCancelResult = {
  state: BeachState
  reservation: Reservation
  registryEventIntent: {
    type: 'operator_booking_cancelled'
    reservationId: string
  }
}

const hasPeriod = (input: OperatorBookingDraftInput): input is OperatorBookingDraftInput & {
  reservationType: ReservationType
  startDate: string
  endDate: string
} => Boolean(input.reservationType && input.startDate && input.endDate)

const toAvailabilityPeriod = (
  reservationType: ReservationType,
  startDate: string,
  endDate: string,
): AvailabilityPeriod => ({
  type: reservationType === 'daily' && startDate !== endDate ? 'multi_day' : reservationType,
  startDate,
  endDate,
  label: reservationType,
})

const getFirstValidationError = (result: OperatorBookingValidationResult): OperatorBookingErrorCode =>
  result.errors[0] ?? 'reservation_save_failed'

const messageForError = (code: OperatorBookingErrorCode): string => {
  switch (code) {
    case 'missing_item':
      return 'Posto non selezionato.'
    case 'missing_customer':
      return 'Cliente richiesto prima della prenotazione.'
    case 'missing_period':
      return 'Periodo prenotazione non impostato.'
    case 'unavailable_period':
      return 'Periodo già occupato.'
    case 'pricing_unavailable':
      return 'Prezzo non disponibile.'
    case 'account_link_failed':
      return 'Collegamento conto non riuscito.'
    case 'reservation_save_failed':
      return 'Salvataggio prenotazione non riuscito.'
  }
}

export const validateOperatorBookingDraft = async (
  input: OperatorBookingDraftInput,
): Promise<OperatorBookingValidationResult> => {
  const errors: OperatorBookingErrorCode[] = []

  if (!input.item) {
    errors.push('missing_item')
  }
  if (!input.assignedCustomer) {
    errors.push('missing_customer')
  }
  if (!hasPeriod(input)) {
    errors.push('missing_period')
  }

  if (errors.length > 0 || !input.item || !input.assignedCustomer || !hasPeriod(input)) {
    return {
      valid: false,
      errors,
      availability: null,
      confirmability: null,
    }
  }

  const period = toAvailabilityPeriod(input.reservationType, input.startDate, input.endDate)
  const [availability, confirmability] = await Promise.all([
    checkItemAvailability({
      itemId: input.item.id,
      period,
      excludeReservationId: input.reservationId,
      mode: 'operator_app',
    }),
    canConfirmBooking({
      id: input.reservationId,
      itemId: input.item.id,
      customerId: input.assignedCustomer.customer.id,
      period,
      mode: 'operator_app',
    }),
  ])

  if (!confirmability.canConfirm) {
    errors.push('unavailable_period')
  }

  return {
    valid: errors.length === 0,
    errors,
    availability,
    confirmability,
  }
}

export const prepareOperatorBooking = async (input: {
  item: BeachItem | null
  priceSuggestion?: PriceSuggestion | null
}): Promise<OperatorBookingPreparation> => {
  const reservation = input.item?.currentReservation ?? null
  const assignedCustomer = input.item?.assignedCustomer ?? null
  const validation =
    input.item && assignedCustomer && reservation
      ? await validateOperatorBookingDraft({
          item: input.item,
          assignedCustomer,
          reservationId: reservation.id,
          reservationType: reservation.reservationType,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
        })
      : null

  return {
    item: input.item,
    assignedCustomer,
    reservation,
    priceSuggestion: input.priceSuggestion ?? null,
    account: input.item?.activeAccount ?? null,
    availability: validation?.availability ?? null,
    confirmability: validation?.confirmability ?? null,
    accountStatus: input.item?.activeAccount?.status ?? 'missing',
  }
}

export const confirmOperatorBooking = async (
  input: OperatorBookingConfirmInput,
): Promise<OperatorBookingResult> => {
  const validation = await validateOperatorBookingDraft(input)
  if (!validation.valid || !validation.availability || !validation.confirmability) {
    const code = getFirstValidationError(validation)
    throw new OperatorBookingError(code, messageForError(code))
  }

  try {
    const result = await savePeriodAndEnsureAccount(input)
    return {
      ...result,
      availability: validation.availability,
      confirmability: validation.confirmability,
      registryEventIntent: {
        type: result.createdReservation ? 'operator_booking_confirmed' : 'operator_booking_updated',
        reservationId: result.reservation.id,
        itemId: input.item.id,
        customerId: input.assignedCustomer.customer.id,
      },
    }
  } catch (error) {
    if (error instanceof OperatorBookingError) throw error
    throw new OperatorBookingError(
      'reservation_save_failed',
      error instanceof Error ? error.message : messageForError('reservation_save_failed'),
    )
  }
}

export const updateOperatorBookingPeriod = confirmOperatorBooking

export const cancelOperatorBooking = async (
  reservationId: string,
): Promise<OperatorBookingCancelResult> => {
  const reservation = await getReservation(reservationId)
  if (!reservation) {
    throw new OperatorBookingError('reservation_save_failed', 'Prenotazione non trovata.')
  }
  const state = await cancelReservationAndReload(reservationId)
  return {
    state,
    reservation: { ...reservation, status: 'cancelled', active: false },
    registryEventIntent: {
      type: 'operator_booking_cancelled',
      reservationId,
    },
  }
}

export const linkOperatorBookingAccount = async (input: {
  reservationId: string
  accountId: string
}): Promise<{ state: BeachState; reservation: Reservation }> => {
  const reservation = await getReservation(input.reservationId)
  if (!reservation) {
    throw new OperatorBookingError('reservation_save_failed', 'Prenotazione non trovata.')
  }

  try {
    const updated = await updateReservation(input.reservationId, {
      itemId: reservation.itemId,
      customerId: reservation.customerId,
      assignmentId: reservation.assignmentId,
      accountId: input.accountId,
      reservationType: reservation.reservationType,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      title: reservation.title,
      notes: reservation.notes,
    })
    return {
      state: await loadBeachState(),
      reservation: updated,
    }
  } catch (error) {
    throw new OperatorBookingError(
      'account_link_failed',
      error instanceof Error ? error.message : messageForError('account_link_failed'),
    )
  }
}

export const getOperatorBookingConflicts = async (input: OperatorBookingDraftInput) => {
  if (!input.item || !hasPeriod(input)) {
    return []
  }
  return detectBookingConflicts({
    draft: {
      id: input.reservationId,
      itemId: input.item.id,
      customerId: input.assignedCustomer?.customer.id,
      period: toAvailabilityPeriod(input.reservationType, input.startDate, input.endDate),
      mode: 'operator_app',
    },
    persist: false,
  })
}
