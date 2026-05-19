import { createAccountForAssignment, getActiveAccountForItem, getPaymentsForAccount, updateAccountTotal } from '../db/accountRepository'
import { getIncludedItemsForTariffContext, recalculateAccountTotalWithExtras } from '../db/extraItemRepository'
import { createReservation, updateReservation } from '../db/reservationRepository'
import { suggestPriceForItem } from '../db/tariffRepository'
import {
  createPricingSnapshot,
  getPricingSnapshotForReservation,
} from '../booking/pricingSnapshotService'
import type { PricingSnapshot } from '../booking/pricingSnapshot.types'
import { appendBookingEvent, appendFolioEvent } from '../registry/registryEventService'
import type { Account, PaymentScheduleInput } from '../types/account'
import type { BeachItem } from '../types/beach'
import type { BeachItemAssignedCustomer } from '../types/customer'
import type { BeachState } from '../types/db'
import type { TariffIncludedItem } from '../types/extraItem'
import type { Reservation, ReservationInput, ReservationType } from '../types/reservation'
import { loadActiveOperationalBeachState } from './beachLayoutService'
import { assignCustomerToItem } from './customerService'
import { createOrUpdatePaymentSchedule } from './accountService'

export type SavePeriodAndEnsureAccountInput = {
  item: BeachItem
  assignedCustomer: BeachItemAssignedCustomer
  reservationId?: string | null
  reservationType: ReservationType
  startDate: string
  endDate: string
  manualAmountCents?: number | null
}

export type SavePeriodAndEnsureAccountResult = {
  state: BeachState
  reservation: Reservation
  account: Account
  pricingSnapshot: PricingSnapshot | null
  createdReservation: boolean
}

export const assignCustomerAndAdvance = async (
  itemId: string,
  customerId: string,
  assignmentType: ReservationType = 'daily',
): Promise<BeachState> => {
  await assignCustomerToItem(itemId, customerId, assignmentType, '')
  return loadActiveOperationalBeachState()
}

export const ensureAccountForReservation = async (
  item: BeachItem,
  reservation: Reservation,
  assignedCustomer: BeachItemAssignedCustomer,
  manualAmountCents?: number | null,
): Promise<Account> => {
  const existing = await getActiveAccountForItem(item.id)
  const suggestion = await suggestPriceForItem(item, reservation.reservationType, reservation.startDate)
  const dayCount = Math.max(
    1,
    Math.round(
      (new Date(`${reservation.endDate}T00:00:00`).getTime() -
        new Date(`${reservation.startDate}T00:00:00`).getTime()) /
        86_400_000,
    ) + 1,
  )
  const suggestedAmount = suggestion.confidence === 'none'
    ? 0
    : suggestion.amountCents * (reservation.reservationType === 'daily' ? dayCount : 1)
  const baseAmountCents = Math.max(0, manualAmountCents ?? suggestedAmount)
  const listinoNote = suggestion.confidence === 'none'
    ? 'Manuale'
    : `Da listino: ${suggestion.tariffRule?.name ?? suggestion.reason}${reservation.reservationType === 'daily' ? ` · ${dayCount} giorni` : ''}`
  const isManualAccount = existing?.notes?.toLowerCase().includes('manuale') ?? false

  if (!existing) {
    return createAccountForAssignment({
      itemId: item.id,
      customerId: assignedCustomer.customer.id,
      assignmentId: assignedCustomer.assignment.id,
      accountType: reservation.reservationType,
      seasonLabel: reservation.reservationType === 'seasonal' ? String(new Date(reservation.startDate).getFullYear()) : null,
      totalAmountCents: baseAmountCents,
      notes: manualAmountCents != null ? 'Manuale' : listinoNote,
    })
  }

  const payments = await getPaymentsForAccount(existing.id)
  if (!isManualAccount && payments.length === 0 && baseAmountCents !== existing.baseAmountCents) {
    return updateAccountTotal(existing.id, baseAmountCents, manualAmountCents != null ? 'Manuale' : listinoNote)
  }

  return existing
}

export const savePeriodAndEnsureAccount = async (
  input: SavePeriodAndEnsureAccountInput,
): Promise<SavePeriodAndEnsureAccountResult> => {
  const reservationInput: ReservationInput = {
    itemId: input.item.id,
    customerId: input.assignedCustomer.customer.id,
    assignmentId: input.assignedCustomer.assignment.id,
    accountId: input.item.activeAccount?.id ?? null,
    reservationType: input.reservationType,
    startDate: input.startDate,
    endDate: input.endDate,
  }

  const createdReservation = !input.reservationId
  const reservation = input.reservationId
    ? await updateReservation(input.reservationId, reservationInput)
    : await createReservation(reservationInput)
  const account = await ensureAccountForReservation(
    input.item,
    reservation,
    input.assignedCustomer,
    input.manualAmountCents,
  )

  if (reservation.accountId !== account.id) {
    await updateReservation(reservation.id, { ...reservationInput, accountId: account.id })
  }
  const existingSnapshot = await getPricingSnapshotForReservation(reservation.id)
  const pricingSnapshot = existingSnapshot ?? (await createPricingSnapshot({
    reservationId: reservation.id,
    accountId: account.id,
    itemId: input.item.id,
    customerId: input.assignedCustomer.customer.id,
    source: 'operator_app',
    manualOverride: input.manualAmountCents != null
      ? {
          enabled: true,
          amountCents: input.manualAmountCents,
          reason: 'Importo manuale conto',
          source: 'operator_app',
        }
      : null,
  })).snapshot
  await appendBookingEvent({
    type: createdReservation ? 'booking_created' : 'booking_confirmed',
    severity: 'success',
    title: createdReservation ? 'Prenotazione creata' : 'Prenotazione confermata',
    links: {
      entityType: 'reservation',
      entityId: reservation.id,
      reservationId: reservation.id,
      customerId: reservation.customerId,
      accountId: account.id,
      itemId: reservation.itemId,
      pricingSnapshotId: pricingSnapshot.id,
    },
    amountCents: account.totalAmountCents,
    payload: {
      reservationType: reservation.reservationType,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      accountStatus: account.status,
    },
    dedupeKey: `${createdReservation ? 'booking_created' : 'booking_confirmed'}:${reservation.id}:${reservation.updatedAt}`,
  })
  await appendFolioEvent({
    type: createdReservation ? 'folio_created' : 'folio_updated',
    severity: 'success',
    title: createdReservation ? 'Conto prenotazione preparato' : 'Conto prenotazione aggiornato',
    links: {
      entityType: 'account',
      entityId: account.id,
      reservationId: reservation.id,
      customerId: account.customerId,
      accountId: account.id,
      itemId: account.itemId,
      pricingSnapshotId: pricingSnapshot.id,
    },
    amountCents: account.totalAmountCents,
    payload: {
      status: account.status,
      balanceAmountCents: account.balanceAmountCents,
      pricingSnapshotId: pricingSnapshot.id,
    },
    dedupeKey: `${createdReservation ? 'folio_created' : 'folio_updated'}:${reservation.id}:${account.id}:${account.updatedAt}`,
  })

  return {
    state: await loadActiveOperationalBeachState(),
    reservation,
    account,
    pricingSnapshot,
    createdReservation,
  }
}

export const calculateIncludedEquipmentForItem = async (
  item: BeachItem,
  reservationType: ReservationType,
): Promise<TariffIncludedItem[]> => {
  return getIncludedItemsForTariffContext(item.type, item.rowLabel, reservationType)
}

export const recalculateAccountWithExtras = async (accountId: string): Promise<BeachState> => {
  await recalculateAccountTotalWithExtras(accountId)
  return loadActiveOperationalBeachState()
}

export const createOrUpdatePaymentScheduleForAccount = async (
  accountId: string,
  options: Omit<PaymentScheduleInput, 'accountId'> = {},
) => {
  return createOrUpdatePaymentSchedule({ accountId, ...options })
}
