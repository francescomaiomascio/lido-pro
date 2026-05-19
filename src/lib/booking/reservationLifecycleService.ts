import { getAccount } from '../db/accountRepository'
import { getActiveLayout, getBeachItems } from '../db/beachRepository'
import {
  appendBookingStatusEvent,
  createBookingChangeRequest,
  getBookingChangeRequestById,
  listBookingChangeRequests,
  updateBookingChangeRequestStatus,
} from '../db/bookingRepository'
import { cancelReservation, getReservation, updateReservation } from '../db/reservationRepository'
import { loadPaymentsForAccount } from '../services/accountService'
import { appendBookingEvent, appendFolioEvent } from '../registry/registryEventService'
import type { Account } from '../types/account'
import type { BeachItem } from '../types/beach'
import type { Reservation, ReservationInput } from '../types/reservation'
import { checkItemAvailability, getAvailabilityForRange, canConfirmBooking } from './availabilityService'
import { previewCancellationAccountImpact, previewPeriodChangeAccountImpact } from './bookingAccountImpactService'
import type { BookingPeriodInput, NormalizedBookingPeriod } from './bookingPeriod.types'
import {
  normalizeBookingPeriod,
  periodToAvailabilityPeriod,
  periodToReservationType,
  validateBookingPeriod,
} from './bookingPeriodService'
import type { BookingSource, BookingUsageMode } from './bookingDomain.types'
import {
  canCancelReservation,
  canChangePeriod,
  canRequestClientChange,
  reservationStatusToLifecycleStatus,
} from './reservationLifecyclePolicy'
import type {
  ClientBookingProjection,
  ReservationCancellationProposal,
  ReservationLifecycleEventType,
  ReservationPeriodChangeProposal,
} from './reservationLifecycle.types'

export type ReservationLifecycleSourceInput = {
  source: BookingSource
  actorId?: string | null
  mode: BookingUsageMode
}

export type ReservationPeriodChangeInput = ReservationLifecycleSourceInput & {
  reservationId: string
  proposedPeriod: BookingPeriodInput
  createClientRequest?: boolean
}

export type ApplyReservationPeriodChangeInput = ReservationPeriodChangeInput & {
  changeRequestId?: string | null
}

export type ReservationCancellationInput = ReservationLifecycleSourceInput & {
  reservationId: string
  reason?: string | null
  createClientRequest?: boolean
}

export type ApplyReservationCancellationInput = ReservationCancellationInput & {
  changeRequestId?: string | null
}

const clientModes: BookingUsageMode[] = ['client_web', 'client_app']

const reservationToBookingPeriod = (reservation: Reservation): NormalizedBookingPeriod =>
  normalizeBookingPeriod({
    id: `reservation-${reservation.id}-period`,
    type: reservation.reservationType === 'seasonal'
      ? 'seasonal'
      : reservation.startDate === reservation.endDate
        ? 'daily'
        : 'multi_day',
    startDate: reservation.startDate,
    endDate: reservation.endDate,
    label: reservation.reservationType,
  })

const loadReservationOrThrow = async (reservationId: string): Promise<Reservation> => {
  const reservation = await getReservation(reservationId)
  if (!reservation) {
    throw new Error('Prenotazione non trovata.')
  }
  return reservation
}

const loadReservationAccount = async (reservation: Reservation): Promise<Account | null> => {
  if (!reservation.accountId) {
    return null
  }
  return getAccount(reservation.accountId)
}

const appendLifecycleEvent = async (input: {
  reservationId: string
  requestId?: string | null
  eventType: ReservationLifecycleEventType
  source: BookingSource
  actorId?: string | null
  payload?: Record<string, unknown> | null
}) => appendBookingStatusEvent({
  reservationId: input.reservationId,
  requestId: input.requestId,
  fromStatus: null,
  toStatus: input.eventType,
  source: input.source,
  reason: input.eventType,
  payload: input.payload,
  createdBy: input.actorId,
})

const assertCanApplyDirectly = async (input: {
  reservation: Reservation
  mode: BookingUsageMode
  changeRequestId?: string | null
  actorId?: string | null
}) => {
  if (input.mode === 'operator_app' && !input.changeRequestId) {
    return null
  }

  if (!input.changeRequestId) {
    throw new Error('Le modalita cliente possono creare richieste, non modificare direttamente la prenotazione.')
  }

  const changeRequest = await getBookingChangeRequestById(input.changeRequestId)
  if (!changeRequest || changeRequest.reservationId !== input.reservation.id) {
    throw new Error('Richiesta modifica prenotazione non trovata.')
  }
  if (changeRequest.status !== 'accepted') {
    throw new Error('Richiesta modifica non accettata.')
  }
  return changeRequest
}

export const proposeReservationPeriodChange = async (
  input: ReservationPeriodChangeInput,
): Promise<ReservationPeriodChangeProposal> => {
  const reservation = await loadReservationOrThrow(input.reservationId)
  const currentPeriod = reservationToBookingPeriod(reservation)
  const proposedPeriod = normalizeBookingPeriod(input.proposedPeriod)
  const account = await loadReservationAccount(reservation)
  const accountImpact = previewPeriodChangeAccountImpact({
    account,
    oldPeriod: currentPeriod,
    newPeriod: proposedPeriod,
  })

  const validation = validateBookingPeriod(proposedPeriod)
  if (!validation.valid || !canChangePeriod(reservation)) {
    return {
      allowed: false,
      mode: input.mode,
      reservation,
      currentPeriod,
      proposedPeriod,
      availability: null,
      confirmability: null,
      accountImpact,
      changeRequest: null,
      reason: validation.errors[0] ?? 'policy_blocked',
    }
  }

  const availabilityPeriod = periodToAvailabilityPeriod(proposedPeriod)
  const [availability, confirmability] = await Promise.all([
    getAvailabilityForRange({
      period: availabilityPeriod,
      filters: { itemId: reservation.itemId },
      excludeReservationId: reservation.id,
      mode: input.mode,
    }),
    canConfirmBooking({
      id: reservation.id,
      itemId: reservation.itemId,
      customerId: reservation.customerId,
      period: availabilityPeriod,
      mode: input.mode,
    }),
  ])

  const allowed = confirmability.canConfirm
  const shouldCreateClientRequest = input.createClientRequest !== false
  const changeRequest = shouldCreateClientRequest && clientModes.includes(input.mode) && canRequestClientChange(reservation, input.mode)
    ? await createBookingChangeRequest({
        reservationId: reservation.id,
        source: input.source === 'sync' ? 'system' : input.source,
        type: 'change_period',
        status: 'requested',
        payload: {
          proposedPeriod,
          currentPeriod,
          mode: input.mode,
        },
        availabilityResult: availability as unknown as Record<string, unknown>,
        accountImpact: accountImpact as unknown as Record<string, unknown>,
      })
    : null

  if (changeRequest) {
    await appendLifecycleEvent({
      reservationId: reservation.id,
      requestId: changeRequest.id,
      eventType: 'client_change_requested',
      source: input.source,
      actorId: input.actorId,
      payload: { type: 'change_period', proposedPeriod, accountImpact },
    })
    await appendBookingEvent({
      type: 'booking_change_requested',
      severity: 'info',
      title: 'Richiesta modifica prenotazione',
      description: 'Il cliente ha richiesto un cambio periodo.',
      links: {
        entityType: 'booking_change_request',
        entityId: changeRequest.id,
        reservationId: reservation.id,
        requestId: changeRequest.id,
        customerId: reservation.customerId,
        itemId: reservation.itemId,
        accountId: reservation.accountId ?? null,
      },
      payload: { type: 'change_period', proposedPeriod, accountImpact },
      dedupeKey: `booking_change_requested:${changeRequest.id}`,
      createdBy: input.actorId ?? null,
    })
  }

  return {
    allowed,
    mode: input.mode,
    reservation,
    currentPeriod,
    proposedPeriod,
    availability,
    confirmability,
    accountImpact,
    changeRequest,
    reason: allowed ? null : 'availability_conflict',
  }
}

export const applyReservationPeriodChange = async (
  input: ApplyReservationPeriodChangeInput,
): Promise<{
  reservation: Reservation
  accountImpact: ReturnType<typeof previewPeriodChangeAccountImpact>
}> => {
  const proposal = await proposeReservationPeriodChange({ ...input, createClientRequest: false })
  if (!proposal.allowed) {
    throw new Error(proposal.reason ?? 'Cambio periodo non consentito.')
  }

  const acceptedChangeRequest = await assertCanApplyDirectly({
    reservation: proposal.reservation,
    mode: input.mode,
    changeRequestId: input.changeRequestId,
    actorId: input.actorId,
  })

  const availability = await checkItemAvailability({
    itemId: proposal.reservation.itemId,
    period: periodToAvailabilityPeriod(proposal.proposedPeriod),
    excludeReservationId: proposal.reservation.id,
    mode: input.mode,
  })
  if (!availability.available) {
    throw new Error('Periodo non disponibile.')
  }

  const reservationInput: ReservationInput = {
    itemId: proposal.reservation.itemId,
    customerId: proposal.reservation.customerId,
    assignmentId: proposal.reservation.assignmentId,
    accountId: proposal.reservation.accountId,
    reservationType: periodToReservationType(proposal.proposedPeriod),
    startDate: proposal.proposedPeriod.startDate,
    endDate: proposal.proposedPeriod.endDate,
    title: proposal.reservation.title,
    notes: proposal.reservation.notes,
  }
  const updated = await updateReservation(proposal.reservation.id, reservationInput)

  if (acceptedChangeRequest) {
    await updateBookingChangeRequestStatus(acceptedChangeRequest.id, 'applied', input.actorId)
  }
  await appendLifecycleEvent({
    reservationId: updated.id,
    requestId: acceptedChangeRequest?.id ?? null,
    eventType: 'reservation_period_changed',
    source: input.source,
    actorId: input.actorId,
    payload: {
      from: proposal.currentPeriod,
      to: proposal.proposedPeriod,
      accountImpact: proposal.accountImpact,
    },
  })
  await appendBookingEvent({
    type: 'booking_period_changed',
    severity: proposal.accountImpact.status === 'unchanged' || proposal.accountImpact.status === 'no_account' ? 'success' : 'warning',
    title: 'Periodo prenotazione modificato',
    links: {
      entityType: 'reservation',
      entityId: updated.id,
      reservationId: updated.id,
      requestId: acceptedChangeRequest?.id ?? null,
      customerId: updated.customerId,
      accountId: updated.accountId ?? null,
      itemId: updated.itemId,
    },
    payload: {
      from: proposal.currentPeriod,
      to: proposal.proposedPeriod,
      accountImpact: proposal.accountImpact,
    },
    dedupeKey: `booking_period_changed:${updated.id}:${updated.updatedAt}`,
    createdBy: input.actorId ?? null,
  })
  if (proposal.accountImpact.status !== 'unchanged' && proposal.accountImpact.status !== 'no_account') {
    await appendLifecycleEvent({
      reservationId: updated.id,
      eventType: 'account_impact_created',
      source: input.source,
      actorId: input.actorId,
      payload: { accountImpact: proposal.accountImpact },
    })
    await appendFolioEvent({
      type: 'folio_manual_review_required',
      severity: 'warning',
      title: 'Impatto conto da verificare',
      description: 'La modifica periodo ha impatto sul conto.',
      links: {
        entityType: 'reservation',
        entityId: updated.id,
        reservationId: updated.id,
        customerId: updated.customerId,
        accountId: updated.accountId ?? null,
        itemId: updated.itemId,
      },
      payload: { accountImpact: proposal.accountImpact },
      dedupeKey: `folio_manual_review_required:period:${updated.id}:${updated.updatedAt}`,
      createdBy: input.actorId ?? null,
    })
  }

  return {
    reservation: updated,
    accountImpact: proposal.accountImpact,
  }
}

export const proposeReservationCancellation = async (
  input: ReservationCancellationInput,
): Promise<ReservationCancellationProposal> => {
  const reservation = await loadReservationOrThrow(input.reservationId)
  const account = await loadReservationAccount(reservation)
  const accountImpact = previewCancellationAccountImpact({ account })
  const allowed = canCancelReservation(reservation)

  const shouldCreateClientRequest = input.createClientRequest !== false
  const changeRequest = shouldCreateClientRequest && clientModes.includes(input.mode) && canRequestClientChange(reservation, input.mode)
    ? await createBookingChangeRequest({
        reservationId: reservation.id,
        source: input.source === 'sync' ? 'system' : input.source,
        type: 'cancel_booking',
        status: 'requested',
        payload: {
          reason: input.reason ?? null,
          mode: input.mode,
        },
        accountImpact: accountImpact as unknown as Record<string, unknown>,
      })
    : null

  if (changeRequest) {
    await appendLifecycleEvent({
      reservationId: reservation.id,
      requestId: changeRequest.id,
      eventType: 'client_change_requested',
      source: input.source,
      actorId: input.actorId,
      payload: { type: 'cancel_booking', accountImpact },
    })
    await appendBookingEvent({
      type: 'booking_change_requested',
      severity: 'info',
      title: 'Richiesta annullamento prenotazione',
      description: input.reason ?? null,
      links: {
        entityType: 'booking_change_request',
        entityId: changeRequest.id,
        reservationId: reservation.id,
        requestId: changeRequest.id,
        customerId: reservation.customerId,
        accountId: reservation.accountId ?? null,
        itemId: reservation.itemId,
      },
      payload: { type: 'cancel_booking', accountImpact },
      dedupeKey: `booking_change_requested:${changeRequest.id}`,
      createdBy: input.actorId ?? null,
    })
  }

  return {
    allowed,
    mode: input.mode,
    reservation,
    accountImpact,
    changeRequest,
    reason: allowed ? null : 'policy_blocked',
  }
}

export const applyReservationCancellation = async (
  input: ApplyReservationCancellationInput,
): Promise<{
  reservation: Reservation
  accountImpact: ReturnType<typeof previewCancellationAccountImpact>
}> => {
  const proposal = await proposeReservationCancellation({ ...input, createClientRequest: false })
  if (!proposal.allowed) {
    throw new Error(proposal.reason ?? 'Annullamento non consentito.')
  }

  const acceptedChangeRequest = await assertCanApplyDirectly({
    reservation: proposal.reservation,
    mode: input.mode,
    changeRequestId: input.changeRequestId,
    actorId: input.actorId,
  })

  const cancelled = await cancelReservation(proposal.reservation.id)
  if (acceptedChangeRequest) {
    await updateBookingChangeRequestStatus(acceptedChangeRequest.id, 'applied', input.actorId)
  }
  await appendLifecycleEvent({
    reservationId: cancelled.id,
    requestId: acceptedChangeRequest?.id ?? null,
    eventType: 'reservation_cancelled',
    source: input.source,
    actorId: input.actorId,
    payload: {
      reason: input.reason ?? null,
      accountImpact: proposal.accountImpact,
    },
  })
  await appendBookingEvent({
    type: 'booking_cancelled',
    severity: ['credit_required', 'refund_required', 'manual_review_required'].includes(proposal.accountImpact.status)
      ? 'warning'
      : 'info',
    title: 'Prenotazione annullata',
    description: input.reason ?? null,
    links: {
      entityType: 'reservation',
      entityId: cancelled.id,
      reservationId: cancelled.id,
      requestId: acceptedChangeRequest?.id ?? null,
      customerId: cancelled.customerId,
      accountId: cancelled.accountId ?? null,
      itemId: cancelled.itemId,
    },
    payload: { accountImpact: proposal.accountImpact },
    dedupeKey: `booking_cancelled:${cancelled.id}:${cancelled.updatedAt}`,
    createdBy: input.actorId ?? null,
  })
  if (['credit_required', 'refund_required', 'manual_review_required'].includes(proposal.accountImpact.status)) {
    await appendLifecycleEvent({
      reservationId: cancelled.id,
      eventType: 'refund_or_credit_required',
      source: input.source,
      actorId: input.actorId,
      payload: { accountImpact: proposal.accountImpact },
    })
    await appendFolioEvent({
      type: 'credit_or_refund_required',
      severity: 'warning',
      title: 'Credito o rimborso da valutare',
      description: 'Annullamento con impatto economico sul conto.',
      links: {
        entityType: 'reservation',
        entityId: cancelled.id,
        reservationId: cancelled.id,
        customerId: cancelled.customerId,
        accountId: cancelled.accountId ?? null,
        itemId: cancelled.itemId,
      },
      payload: { accountImpact: proposal.accountImpact },
      dedupeKey: `credit_or_refund_required:${cancelled.id}:${cancelled.updatedAt}`,
      createdBy: input.actorId ?? null,
    })
  }

  return {
    reservation: cancelled,
    accountImpact: proposal.accountImpact,
  }
}

const loadItemSummary = async (itemId: string): Promise<BeachItem | null> => {
  const layout = await getActiveLayout()
  const items = await getBeachItems(layout.id)
  return items.find((item) => item.id === itemId) ?? null
}

export const buildClientBookingProjection = async (
  reservationId: string,
): Promise<ClientBookingProjection | null> => {
  const reservation = await getReservation(reservationId)
  if (!reservation) {
    return null
  }
  const [account, item, pendingRequests] = await Promise.all([
    loadReservationAccount(reservation),
    loadItemSummary(reservation.itemId),
    listBookingChangeRequests({ reservationId }),
  ])
  const payments = account ? await loadPaymentsForAccount(account.id) : []
  const pendingChangeRequest =
    pendingRequests.find((request) => ['requested', 'pending_operator_review', 'accepted'].includes(request.status)) ??
    null
  const status = reservationStatusToLifecycleStatus(reservation.status)

  return {
    reservationId: reservation.id,
    status,
    customerVisibleStatus: pendingChangeRequest
      ? 'pending_change'
      : status === 'cancelled'
        ? 'cancelled'
        : status === 'completed'
          ? 'completed'
          : status === 'active'
            ? 'active'
            : status === 'confirmed'
              ? 'confirmed'
              : 'needs_review',
    period: reservationToBookingPeriod(reservation),
    itemSummary: item
      ? {
          itemId: item.id,
          code: item.code,
          type: item.type,
          rowLabel: item.rowLabel,
          numberIndex: item.numberIndex,
        }
      : null,
    folioSummary: account
      ? {
          accountId: account.id,
          status: account.status,
          totalAmountCents: account.totalAmountCents,
          paidAmountCents: account.paidAmountCents,
          balanceAmountCents: account.balanceAmountCents,
        }
      : null,
    paymentsSummary: {
      paidAmountCents: payments.reduce((sum, payment) => sum + payment.amountCents, 0),
      balanceAmountCents: account?.balanceAmountCents ?? 0,
    },
    lastUpdatedAt: pendingChangeRequest?.updatedAt ?? reservation.updatedAt,
    pendingChangeRequest,
  }
}
