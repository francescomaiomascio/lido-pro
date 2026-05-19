import { getActiveLayout, getBeachItems } from '../db/beachRepository'
import {
  getBookingChangeRequestById,
  getBookingRequestById,
  listBookingChangeRequests,
  listBookingRequests,
  listPairingCandidates,
  markBookingRequestConverted,
  updateBookingChangeRequestStatus,
  updateBookingRequestStatus,
} from '../db/bookingRepository'
import { getCustomer } from '../db/customerRepository'
import { getReservation } from '../db/reservationRepository'
import { appendBookingEvent } from '../registry/registryEventService'
import { decidePairing, generatePairingCandidates, getPairingState } from './customerPairingService'
import { checkItemAvailability, getAvailabilityForRange } from './availabilityService'
import { confirmCustomerBooking } from './customerBookingService'
import { periodToAvailabilityPeriod, periodToDisplayLabel, periodToReservationType } from './bookingPeriodService'
import {
  applyReservationCancellation,
  applyReservationPeriodChange,
  proposeReservationCancellation,
  proposeReservationPeriodChange,
} from './reservationLifecycleService'
import type { CustomerInput } from '../types/customer'
import type { BeachItem } from '../types/beach'
import type { AvailabilityResult } from './availability.types'
import type { BookingPeriodInput } from './bookingPeriod.types'
import type {
  BookingChangeRequestRecord,
  BookingCustomerPairingCandidateRecord,
  BookingRequestRecord,
} from './bookingPersistence.types'
import type {
  BookingInboxActionResult,
  BookingInboxDetail,
  BookingInboxFilter,
  BookingInboxItem,
  BookingInboxItemKind,
} from './bookingInbox.types'

type InboxRaw = {
  kind: BookingInboxItemKind
  request: BookingRequestRecord | BookingChangeRequestRecord
}

type AcceptBookingRequestInput = {
  requestId: string
  itemId?: string | null
  customerId?: string | null
  createCustomerInput?: CustomerInput | null
  actorId?: string | null
}

type ApplyChangeRequestInput = {
  changeRequestId: string
  actorId?: string | null
}

const terminalRequestStatuses = ['accepted', 'rejected', 'expired', 'converted_to_booking']
const terminalChangeStatuses = ['rejected', 'applied', 'cancelled']

const sourceLabel = (source: string) => {
  if (source === 'client_web') return 'Web cliente'
  if (source === 'client_app') return 'App cliente'
  if (source === 'import_ai' || source === 'ai_draft' || source === 'import') return 'Import'
  if (source === 'operator') return 'Operatore'
  return source
}

const customerNameFromPayload = (payload: BookingRequestRecord['customerPayload']) =>
  payload.fullName ||
  payload.name ||
  [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim() ||
  'Cliente da abbinare'

const itemLabel = (item: BeachItem | null | undefined) => {
  if (!item) return null
  return [
    item.type === 'palm' ? 'Palma' : item.type === 'umbrella' ? 'Ombrellone' : 'Palmetta',
    item.rowLabel ? `Fila ${item.rowLabel}` : null,
    item.numberIndex ? `Posto ${item.numberIndex}` : item.code,
  ].filter(Boolean).join(' · ')
}

const loadItemsById = async () => {
  const layout = await getActiveLayout()
  const items = await getBeachItems(layout.id)
  return new Map(items.map((item) => [item.id, item]))
}

const getBookingRequestAvailability = async (
  request: BookingRequestRecord,
): Promise<AvailabilityResult | null> => {
  if (!request.requestedPeriod?.startDate) return null
  return getAvailabilityForRange({
    period: periodToAvailabilityPeriod(request.requestedPeriod),
    filters: {
      itemId: request.requestedItemId ?? null,
      itemType: request.requestedItemType ?? null,
    },
    excludeRequestId: request.id,
    mode: 'operator_app',
  })
}

const getChangeRequestPeriod = (request: BookingChangeRequestRecord): BookingPeriodInput | null => {
  const proposed = request.payload.proposedPeriod
  if (!proposed || typeof proposed !== 'object') return null
  const period = proposed as Partial<BookingPeriodInput>
  if (!period.type || !period.startDate) return null
  return {
    id: period.id,
    type: period.type,
    startDate: period.startDate,
    endDate: period.endDate ?? period.startDate,
    startTime: period.startTime,
    endTime: period.endTime,
    label: period.label,
  }
}

const getChangeRequestAvailability = async (
  request: BookingChangeRequestRecord,
): Promise<AvailabilityResult | null> => {
  if (request.type !== 'change_period' && request.type !== 'change_item') return null
  const reservation = await getReservation(request.reservationId)
  const proposedPeriod = getChangeRequestPeriod(request)
  if (!reservation || !proposedPeriod) return null
  return getAvailabilityForRange({
    period: periodToAvailabilityPeriod(proposedPeriod),
    filters: {
      itemId: typeof request.payload.itemId === 'string' ? request.payload.itemId : reservation.itemId,
    },
    excludeReservationId: reservation.id,
    mode: 'operator_app',
  })
}

const availabilityState = (availability: AvailabilityResult | null, requestHasItem: boolean) => {
  if (!availability) return requestHasItem ? 'unknown' : 'needs_item'
  if (availability.conflicts.some((conflict) => conflict.severity === 'blocking')) return 'conflict'
  if (availability.available > 0 && availability.unavailable > 0) return 'partial'
  if (availability.available > 0) return 'available'
  return 'conflict'
}

const toBookingInboxItem = async (
  raw: InboxRaw,
  itemsById: Map<string, BeachItem>,
): Promise<BookingInboxItem> => {
  if (raw.kind === 'booking_request') {
    const request = raw.request as BookingRequestRecord
    const [candidates, availability] = await Promise.all([
      listPairingCandidates(request.id),
      getBookingRequestAvailability(request).catch(() => null),
    ])
    const matchedCustomer = request.matchedCustomerId ? await getCustomer(request.matchedCustomerId) : null
    const hasResolvedCustomer = Boolean(request.matchedCustomerId)
    const hasItemChoice = Boolean(request.requestedItemId)
    const status = availabilityState(availability, hasItemChoice || Boolean(request.requestedItemType))
    const converted = request.status === 'converted_to_booking'
    const rejected = request.status === 'rejected'
    const canConvert =
      !converted &&
      !rejected &&
      hasResolvedCustomer &&
      (hasItemChoice || (availability?.available ?? 0) > 0) &&
      status !== 'conflict'
    const disabledReason = !hasResolvedCustomer
      ? 'Abbina o crea un cliente prima di convertire.'
      : status === 'conflict'
        ? 'Disponibilita in conflitto.'
        : !hasItemChoice && (availability?.available ?? 0) === 0
          ? 'Seleziona un posto disponibile.'
          : null
    return {
      id: request.id,
      kind: 'booking_request',
      source: sourceLabel(request.source),
      status: request.status,
      priority: status === 'conflict' ? 'warning' : 'normal',
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      customerSummary: {
        label: matchedCustomer?.fullName ?? customerNameFromPayload(request.customerPayload),
        detail: request.customerPayload.phone || request.customerPayload.email || null,
      },
      periodSummary: {
        label: periodToDisplayLabel(request.requestedPeriod),
      },
      requestedItemSummary: {
        label: itemLabel(request.requestedItemId ? itemsById.get(request.requestedItemId) : null) ??
          request.requestedItemType ??
          'Tipo non specificato',
        detail: request.requestedExtras.length > 0 ? `${request.requestedExtras.length} articoli richiesti` : null,
      },
      pairingStatus: request.pairingStatus,
      pairingCandidateCount: candidates.length,
      availabilityStatus: status,
      conflictCount: availability?.conflicts.filter((conflict) => conflict.severity === 'blocking').length ?? 0,
      accountImpactStatus: null,
      actionState: converted ? 'done' : !hasResolvedCustomer ? 'needs_pairing' : status === 'conflict' ? 'blocked' : 'ready',
      canAccept: canConvert,
      canReject: !terminalRequestStatuses.includes(request.status),
      canConvert,
      canApplyChange: false,
      disabledReason,
    }
  }

  const request = raw.request as BookingChangeRequestRecord
  const [reservation, availability] = await Promise.all([
    getReservation(request.reservationId),
    getChangeRequestAvailability(request).catch(() => null),
  ])
  const customer = reservation ? await getCustomer(reservation.customerId) : null
  const status = request.type === 'cancel_booking'
    ? 'not_applicable'
    : availabilityState(availability, true)
  const impactStatus = typeof request.accountImpact?.status === 'string' ? request.accountImpact.status : null
  const manualImpact = ['credit_required', 'refund_required', 'manual_review_required'].includes(impactStatus ?? '')
  const canApply = !terminalChangeStatuses.includes(request.status) && Boolean(reservation) && status !== 'conflict'
  return {
    id: request.id,
    kind: 'change_request',
    source: sourceLabel(request.source),
    status: request.status,
    priority: manualImpact || status === 'conflict' ? 'warning' : 'normal',
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    customerSummary: {
      label: customer?.fullName ?? 'Cliente collegato',
      detail: reservation?.id ?? null,
    },
    periodSummary: {
      label: getChangeRequestPeriod(request)
        ? periodToDisplayLabel(getChangeRequestPeriod(request) as BookingPeriodInput)
        : 'Periodo prenotazione',
    },
    requestedItemSummary: {
      label: request.type === 'cancel_booking' ? 'Annullamento' : 'Modifica prenotazione',
      detail: reservation ? itemLabel(itemsById.get(reservation.itemId)) : null,
    },
    pairingStatus: 'not_applicable',
    pairingCandidateCount: 0,
    availabilityStatus: status,
    conflictCount: availability?.conflicts.filter((conflict) => conflict.severity === 'blocking').length ?? 0,
    accountImpactStatus: impactStatus,
    actionState: request.status === 'applied' ? 'done' : manualImpact ? 'review' : status === 'conflict' ? 'blocked' : 'ready',
    canAccept: canApply,
    canReject: !terminalChangeStatuses.includes(request.status),
    canConvert: false,
    canApplyChange: canApply,
    disabledReason: !reservation ? 'Prenotazione non trovata.' : status === 'conflict' ? 'Disponibilita in conflitto.' : null,
  }
}

const filterItem = (item: BookingInboxItem, filter: BookingInboxFilter = {}) => {
  if (filter.kind && filter.kind !== 'all' && item.kind !== filter.kind) return false
  if (filter.status && filter.status !== 'all' && item.status !== filter.status) return false
  if (filter.source && filter.source !== 'all' && item.source !== filter.source) return false
  if (filter.pairingStatus && filter.pairingStatus !== 'all' && item.pairingStatus !== filter.pairingStatus) return false
  if (filter.availabilityStatus && filter.availabilityStatus !== 'all' && item.availabilityStatus !== filter.availabilityStatus) return false
  if (filter.priority && filter.priority !== 'all' && item.priority !== filter.priority) return false
  return true
}

export const listBookingInboxItems = async (
  filter: BookingInboxFilter = {},
): Promise<BookingInboxItem[]> => {
  const [bookingRequests, changeRequests, itemsById] = await Promise.all([
    listBookingRequests(),
    listBookingChangeRequests(),
    loadItemsById(),
  ])
  const raw: InboxRaw[] = [
    ...bookingRequests.map((request) => ({ kind: 'booking_request' as const, request })),
    ...changeRequests.map((request) => ({ kind: 'change_request' as const, request })),
  ]
  const items = await Promise.all(raw.map((request) => toBookingInboxItem(request, itemsById)))
  return items
    .filter((item) => filterItem(item, filter))
    .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export const getBookingInboxDetail = async (
  id: string,
  kind: BookingInboxItemKind,
): Promise<BookingInboxDetail | null> => {
  const itemsById = await loadItemsById()
  if (kind === 'booking_request') {
    const request = await getBookingRequestById(id)
    if (!request) return null
    const [item, pairing, availability] = await Promise.all([
      toBookingInboxItem({ kind, request }, itemsById),
      getPairingState(id).catch(async () => ({
        requestId: id,
        status: request.pairingStatus,
        candidates: await listPairingCandidates(id),
        warnings: [],
      })),
      getBookingRequestAvailability(request).catch(() => null),
    ])
    return {
      item,
      rawRequest: request,
      pairingCandidates: pairing.candidates,
      availabilityResult: availability,
      accountImpactPreview: null,
      registryEvents: [],
      availableActions: [
        'refresh_analysis',
        'match_existing',
        'create_new_customer',
        'leave_pending',
        'reject',
        ...(item.canConvert ? ['accept_convert' as const] : []),
      ],
    }
  }

  const request = await getBookingChangeRequestById(id)
  if (!request) return null
  const [item, availability] = await Promise.all([
    toBookingInboxItem({ kind, request }, itemsById),
    getChangeRequestAvailability(request).catch(() => null),
  ])
  return {
    item,
    rawRequest: request,
    pairingCandidates: [],
    availabilityResult: availability,
    accountImpactPreview: request.accountImpact ?? null,
    registryEvents: [],
    availableActions: [
      'leave_pending',
      'reject',
      ...(item.canApplyChange ? ['apply_change' as const] : []),
    ],
  }
}

export const refreshInboxItemAnalysis = async (
  id: string,
  kind: BookingInboxItemKind,
): Promise<BookingInboxDetail | null> => {
  if (kind === 'booking_request') {
    await generatePairingCandidates(id)
  }
  return getBookingInboxDetail(id, kind)
}

export const rejectInboxItem = async (input: {
  id: string
  kind: BookingInboxItemKind
  actorId?: string | null
}): Promise<BookingInboxActionResult> => {
  if (input.kind === 'booking_request') {
    const request = await updateBookingRequestStatus(input.id, 'rejected')
    await appendBookingEvent({
      type: 'booking_change_rejected',
      severity: 'info',
      title: 'Richiesta cliente rifiutata',
      links: {
        entityType: 'booking_request',
        entityId: request.id,
        requestId: request.id,
        customerId: request.matchedCustomerId ?? null,
      },
      dedupeKey: `booking_request_rejected:${request.id}:${request.updatedAt}`,
      createdBy: input.actorId ?? null,
    })
    return {
      item: (await listBookingInboxItems()).find((item) => item.id === request.id && item.kind === 'booking_request') ?? null,
      message: 'Richiesta rifiutata',
    }
  }

  const changeRequest = await updateBookingChangeRequestStatus(input.id, 'rejected', input.actorId)
  await appendBookingEvent({
    type: 'booking_change_rejected',
    severity: 'info',
    title: 'Modifica cliente rifiutata',
    links: {
      entityType: 'booking_change_request',
      entityId: changeRequest.id,
      requestId: changeRequest.id,
      reservationId: changeRequest.reservationId,
    },
    dedupeKey: `booking_change_rejected:${changeRequest.id}:${changeRequest.updatedAt}`,
    createdBy: input.actorId ?? null,
  })
  return {
    item: (await listBookingInboxItems()).find((item) => item.id === changeRequest.id && item.kind === 'change_request') ?? null,
    message: 'Richiesta modifica rifiutata',
  }
}

export const leavePending = async (input: {
  id: string
  kind: BookingInboxItemKind
}): Promise<BookingInboxActionResult> => {
  const item = input.kind === 'booking_request'
    ? await updateBookingRequestStatus(input.id, 'operator_review')
    : await updateBookingChangeRequestStatus(input.id, 'pending_operator_review')
  return {
    item: (await listBookingInboxItems()).find((current) => current.id === item.id && current.kind === input.kind) ?? null,
    message: 'Richiesta lasciata in revisione',
  }
}

export const matchBookingRequestCustomer = async (input: {
  requestId: string
  customerId: string
  actorId?: string | null
}): Promise<BookingInboxDetail | null> => {
  await decidePairing({
    requestId: input.requestId,
    decision: 'match_existing',
    existingCustomerId: input.customerId,
    decidedBy: input.actorId ?? null,
  })
  await appendBookingEvent({
    type: 'customer_paired',
    severity: 'success',
    title: 'Cliente abbinato alla richiesta',
    links: {
      entityType: 'booking_request',
      entityId: input.requestId,
      requestId: input.requestId,
      customerId: input.customerId,
    },
    dedupeKey: `customer_paired:${input.requestId}:${input.customerId}`,
    createdBy: input.actorId ?? null,
  })
  return getBookingInboxDetail(input.requestId, 'booking_request')
}

export const createCustomerForBookingRequest = async (input: {
  requestId: string
  customerInput: CustomerInput
  actorId?: string | null
}): Promise<BookingInboxDetail | null> => {
  const request = await decidePairing({
    requestId: input.requestId,
    decision: 'create_new',
    newCustomerInput: input.customerInput,
    decidedBy: input.actorId ?? null,
  })
  await appendBookingEvent({
    type: 'customer_paired',
    severity: 'success',
    title: 'Cliente creato dalla richiesta',
    links: {
      entityType: 'booking_request',
      entityId: input.requestId,
      requestId: input.requestId,
      customerId: request.matchedCustomerId ?? null,
    },
    dedupeKey: `customer_created_for_request:${input.requestId}:${request.matchedCustomerId ?? 'unknown'}`,
    createdBy: input.actorId ?? null,
  })
  return getBookingInboxDetail(input.requestId, 'booking_request')
}

export const acceptBookingRequest = async (
  input: AcceptBookingRequestInput,
): Promise<BookingInboxActionResult> => {
  const request = await getBookingRequestById(input.requestId)
  if (!request) throw new Error('Richiesta non trovata.')
  let customerId = input.customerId ?? request.matchedCustomerId ?? null
  if (!customerId && input.createCustomerInput) {
    const detail = await createCustomerForBookingRequest({
      requestId: request.id,
      customerInput: input.createCustomerInput,
      actorId: input.actorId ?? null,
    })
    const updatedRequest = detail?.rawRequest as BookingRequestRecord | undefined
    customerId = updatedRequest?.matchedCustomerId ?? null
  }
  if (!customerId) throw new Error('Abbina o crea un cliente prima di accettare.')

  const availability = await getBookingRequestAvailability(request)
  const selectedItemId = input.itemId ?? request.requestedItemId ?? availability?.items.find((item) => item.available)?.itemId
  if (!selectedItemId) throw new Error('Seleziona un posto disponibile.')
  const finalAvailability = await checkItemAvailability({
    itemId: selectedItemId,
    period: periodToAvailabilityPeriod(request.requestedPeriod),
    excludeRequestId: request.id,
    mode: 'operator_app',
  })
  if (!finalAvailability.available) throw new Error('Posto non disponibile per il periodo richiesto.')

  const result = await confirmCustomerBooking({
    customerId,
    itemId: selectedItemId,
    reservationType: periodToReservationType(request.requestedPeriod),
    startDate: request.requestedPeriod.startDate,
    endDate: request.requestedPeriod.endDate ?? request.requestedPeriod.startDate,
  })
  await markBookingRequestConverted(request.id, result.reservation.id)
  await appendBookingEvent({
    type: 'booking_confirmed',
    severity: 'success',
    title: 'Richiesta convertita in prenotazione',
    links: {
      entityType: 'booking_request',
      entityId: request.id,
      requestId: request.id,
      reservationId: result.reservation.id,
      customerId,
      itemId: selectedItemId,
      accountId: result.account.id,
    },
    dedupeKey: `booking_request_converted:${request.id}:${result.reservation.id}`,
    createdBy: input.actorId ?? null,
  })

  return {
    item: (await listBookingInboxItems()).find((item) => item.id === request.id && item.kind === 'booking_request') ?? null,
    message: 'Richiesta convertita in prenotazione',
  }
}

export const applyChangeRequest = async (
  input: ApplyChangeRequestInput,
): Promise<BookingInboxActionResult> => {
  const request = await getBookingChangeRequestById(input.changeRequestId)
  if (!request) throw new Error('Richiesta modifica non trovata.')
  await updateBookingChangeRequestStatus(request.id, 'accepted', input.actorId)

  if (request.type === 'change_period') {
    const proposedPeriod = getChangeRequestPeriod(request)
    if (!proposedPeriod) throw new Error('Periodo richiesto non valido.')
    await applyReservationPeriodChange({
      reservationId: request.reservationId,
      proposedPeriod,
      source: request.source,
      mode: 'operator_app',
      actorId: input.actorId ?? null,
      changeRequestId: request.id,
    })
  } else if (request.type === 'cancel_booking') {
    await applyReservationCancellation({
      reservationId: request.reservationId,
      reason: typeof request.payload.reason === 'string' ? request.payload.reason : null,
      source: request.source,
      mode: 'operator_app',
      actorId: input.actorId ?? null,
      changeRequestId: request.id,
    })
  } else {
    await updateBookingChangeRequestStatus(request.id, 'applied', input.actorId)
  }

  return {
    item: (await listBookingInboxItems()).find((item) => item.id === request.id && item.kind === 'change_request') ?? null,
    message: 'Richiesta applicata',
  }
}

export const previewChangeRequestImpact = async (
  changeRequestId: string,
) => {
  const request = await getBookingChangeRequestById(changeRequestId)
  if (!request) return null
  if (request.type === 'change_period') {
    const proposedPeriod = getChangeRequestPeriod(request)
    if (!proposedPeriod) return null
    return proposeReservationPeriodChange({
      reservationId: request.reservationId,
      proposedPeriod,
      source: request.source,
      mode: 'operator_app',
      createClientRequest: false,
    })
  }
  if (request.type === 'cancel_booking') {
    return proposeReservationCancellation({
      reservationId: request.reservationId,
      source: request.source,
      mode: 'operator_app',
      createClientRequest: false,
    })
  }
  return null
}
