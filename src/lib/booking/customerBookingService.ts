import { getActiveLayout, getBeachItems } from '../db/beachRepository'
import { getAssignedCustomerForItem } from '../db/customerRepository'
import { getCustomerProfile } from '../services/customerProfileService'
import { assignCustomerToItem } from '../services/customerService'
import { suggestPriceForBeachItem } from '../services/tariffService'
import type { Account } from '../types/account'
import type { BeachItem, BeachItemType } from '../types/beach'
import type { CustomerProfile } from '../types/customerProfile'
import type { Reservation, ReservationType } from '../types/reservation'
import type { PriceSuggestion } from '../types/tariff'
import type {
  AvailabilityPeriod,
  AvailabilityResult,
  ItemAvailability,
} from './availability.types'
import { checkItemAvailability, getAvailabilityForRange } from './availabilityService'
import { periodToAvailabilityPeriod } from './bookingPeriodService'
import {
  confirmOperatorBooking,
  OperatorBookingError,
  type OperatorBookingResult,
} from './operatorBookingService'

export type CustomerBookingErrorCode =
  | 'missing_customer'
  | 'missing_period'
  | 'no_available_items'
  | 'unavailable_item'
  | 'reservation_save_failed'
  | 'account_prepare_failed'
  | 'pricing_unavailable'

export class CustomerBookingError extends Error {
  code: CustomerBookingErrorCode

  constructor(code: CustomerBookingErrorCode, message: string) {
    super(message)
    this.name = 'CustomerBookingError'
    this.code = code
  }
}

export type CustomerBookingPeriodInput = {
  reservationType: ReservationType
  startDate: string
  endDate: string
}

export type CustomerBookingAvailabilityInput = CustomerBookingPeriodInput & {
  customerId: string
  itemType?: BeachItemType | 'all'
}

export type CustomerBookingConfirmInput = CustomerBookingPeriodInput & {
  customerId: string
  itemId: string
  manualAmountCents?: number | null
}

export type CustomerBookingAvailableItem = {
  item: BeachItem
  availability: ItemAvailability
  priceSuggestion: PriceSuggestion | null
}

export type CustomerBookingAvailabilityResult = {
  period: AvailabilityPeriod
  availability: AvailabilityResult
  items: CustomerBookingAvailableItem[]
}

export type CustomerBookingContext = {
  profile: CustomerProfile | null
}

export type CustomerBookingConfirmResult = {
  reservation: Reservation
  account: Account
  item: BeachItem
  priceSuggestion: PriceSuggestion | null
  operatorResult: OperatorBookingResult
}

const toAvailabilityPeriod = (input: CustomerBookingPeriodInput): AvailabilityPeriod => ({
  ...periodToAvailabilityPeriod({
    type: input.reservationType,
    startDate: input.startDate,
    endDate: input.endDate,
    label: input.reservationType,
  }),
})

const hasPeriod = (input: CustomerBookingPeriodInput) =>
  Boolean(input.reservationType && input.startDate && input.endDate && input.startDate <= input.endDate)

const mapOperatorError = (error: unknown): CustomerBookingError => {
  if (error instanceof CustomerBookingError) {
    return error
  }

  if (error instanceof OperatorBookingError) {
    if (error.code === 'missing_customer') {
      return new CustomerBookingError('missing_customer', error.message)
    }
    if (error.code === 'missing_period') {
      return new CustomerBookingError('missing_period', error.message)
    }
    if (error.code === 'unavailable_period') {
      return new CustomerBookingError('unavailable_item', error.message)
    }
    if (error.code === 'pricing_unavailable') {
      return new CustomerBookingError('pricing_unavailable', error.message)
    }
    if (error.code === 'account_link_failed') {
      return new CustomerBookingError('account_prepare_failed', error.message)
    }
  }

  return new CustomerBookingError(
    'reservation_save_failed',
    error instanceof Error ? error.message : 'Salvataggio prenotazione non riuscito.',
  )
}

const loadActiveItemsById = async () => {
  const layout = await getActiveLayout()
  const items = await getBeachItems(layout.id)
  return new Map(items.map((item) => [item.id, item]))
}

export const prepareCustomerBooking = async (
  customerId: string,
): Promise<CustomerBookingContext> => ({
  profile: await getCustomerProfile(customerId),
})

export const reloadCustomerBookingContext = prepareCustomerBooking

export const searchAvailableItemsForCustomerBooking = async (
  input: CustomerBookingAvailabilityInput,
): Promise<CustomerBookingAvailabilityResult> => {
  if (!input.customerId) {
    throw new CustomerBookingError('missing_customer', 'Cliente richiesto prima della prenotazione.')
  }
  if (!hasPeriod(input)) {
    throw new CustomerBookingError('missing_period', 'Periodo prenotazione non impostato.')
  }

  const period = toAvailabilityPeriod(input)
  const availability = await getAvailabilityForRange({
    period,
    filters: {
      itemType: input.itemType && input.itemType !== 'all' ? input.itemType : null,
    },
    mode: 'operator_app',
  })

  const itemsById = await loadActiveItemsById()
  const available = availability.items.filter((item) => item.available)
  if (available.length === 0) {
    return { period, availability, items: [] }
  }

  const rows = await Promise.all(
    available.map(async (itemAvailability) => {
      const item = itemsById.get(itemAvailability.itemId)
      if (!item) return null
      if (item.activeAccount && item.activeAccount.customerId !== input.customerId) return null
      const priceSuggestion = await suggestPriceForBeachItem(
        item,
        input.reservationType,
        input.startDate,
      ).catch(() => null)
      return {
        item,
        availability: itemAvailability,
        priceSuggestion,
      }
    }),
  )

  return {
    period,
    availability,
    items: rows.filter((row): row is CustomerBookingAvailableItem => Boolean(row)),
  }
}

export const confirmCustomerBooking = async (
  input: CustomerBookingConfirmInput,
): Promise<CustomerBookingConfirmResult> => {
  if (!input.customerId) {
    throw new CustomerBookingError('missing_customer', 'Cliente richiesto prima della prenotazione.')
  }
  if (!hasPeriod(input)) {
    throw new CustomerBookingError('missing_period', 'Periodo prenotazione non impostato.')
  }

  const period = toAvailabilityPeriod(input)
  const finalAvailability = await checkItemAvailability({
    itemId: input.itemId,
    period,
    mode: 'operator_app',
  })

  if (!finalAvailability.available) {
    throw new CustomerBookingError('unavailable_item', 'Posto non disponibile per il periodo selezionato.')
  }

  try {
    const itemsBeforeAssignment = await loadActiveItemsById()
    const itemBeforeAssignment = itemsBeforeAssignment.get(input.itemId)
    if (!itemBeforeAssignment) {
      throw new CustomerBookingError('unavailable_item', 'Posto non disponibile per il periodo selezionato.')
    }
    if (itemBeforeAssignment.activeAccount && itemBeforeAssignment.activeAccount.customerId !== input.customerId) {
      throw new CustomerBookingError('account_prepare_failed', 'Il posto ha un conto aperto per un altro cliente.')
    }

    await assignCustomerToItem(
      input.itemId,
      input.customerId,
      input.reservationType,
      'Prenotazione creata da scheda cliente',
    )

    const itemsById = await loadActiveItemsById()
    const item = itemsById.get(input.itemId)
    const assignedCustomer = await getAssignedCustomerForItem(input.itemId)
    if (!item || !assignedCustomer) {
      throw new CustomerBookingError('missing_customer', 'Assegnazione cliente non disponibile.')
    }

    const operatorResult = await confirmOperatorBooking({
      item: { ...item, assignedCustomer },
      assignedCustomer,
      reservationType: input.reservationType,
      startDate: input.startDate,
      endDate: input.endDate,
      manualAmountCents: input.manualAmountCents,
    })

    const confirmedItem =
      operatorResult.state.items.find((current) => current.id === input.itemId) ??
      { ...item, assignedCustomer }
    const priceSuggestion = await suggestPriceForBeachItem(
      confirmedItem,
      input.reservationType,
      input.startDate,
    ).catch(() => null)

    return {
      reservation: operatorResult.reservation,
      account: operatorResult.account,
      item: confirmedItem,
      priceSuggestion,
      operatorResult,
    }
  } catch (error) {
    throw mapOperatorError(error)
  }
}
