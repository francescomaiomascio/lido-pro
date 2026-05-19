import { linkBookingRegistryEvent } from '../db/bookingRepository'
import {
  appendRegistryEvent,
  listRegistryEvents,
} from '../db/registryEventRepository'
import type { RegistryRecord } from '../types/registry'
import type {
  RegistryEvent,
  RegistryEventFilter,
  RegistryEventInput,
  RegistryEventLinks,
} from './registryEvent.types'

type DomainEventInput = Omit<RegistryEventInput, 'source' | 'type'> & {
  type: RegistryEventInput['type']
}

const appendAndLink = async (input: RegistryEventInput): Promise<RegistryEvent> => {
  const event = await appendRegistryEvent(input)
  const reservationId = input.links?.reservationId
  const requestId = input.links?.requestId
  if (reservationId || requestId) {
    await linkBookingRegistryEvent({
      reservationId,
      requestId,
      registryEventId: event.id,
      eventType: event.type,
    })
  }
  return event
}

export const appendBookingEvent = async (
  input: DomainEventInput,
): Promise<RegistryEvent> => appendAndLink({ ...input, source: 'booking' })

export const appendFolioEvent = async (
  input: DomainEventInput,
): Promise<RegistryEvent> => appendAndLink({ ...input, source: 'folio' })

export const appendPaymentEvent = async (
  input: DomainEventInput,
): Promise<RegistryEvent> => appendAndLink({ ...input, source: 'payment' })

export const appendPricingEvent = async (
  input: DomainEventInput,
): Promise<RegistryEvent> => appendAndLink({ ...input, source: 'articoli' })

export const appendAvailabilityConflictEvent = async (input: {
  title: string
  description?: string | null
  links?: RegistryEventLinks
  payload?: Record<string, unknown> | null
  dedupeKey?: string | null
}): Promise<RegistryEvent> => appendAndLink({
  source: 'booking',
  type: 'availability_conflict_detected',
  severity: 'warning',
  title: input.title,
  description: input.description,
  links: input.links,
  payload: input.payload,
  dedupeKey: input.dedupeKey,
})

export const listOperationalEvents = async (
  filter: RegistryEventFilter = {},
): Promise<RegistryEvent[]> => listRegistryEvents(filter)

export const toRegistryRecord = (event: RegistryEvent): RegistryRecord => ({
  id: `event:${event.id}`,
  kind: 'reservation',
  reservationId: event.reservationId ?? null,
  accountId: event.accountId ?? null,
  customerId: event.customerId ?? 'registry-event',
  itemId: event.itemId ?? 'registry-event',
  customerName: event.title,
  customerPhone: null,
  itemCode: event.entityType ?? event.source,
  itemType: null,
  reservationType: null,
  reservationStatus: null,
  startDate: event.createdAt.slice(0, 10),
  endDate: event.createdAt.slice(0, 10),
  accountStatus: null,
  totalAmountCents: event.amountCents ?? 0,
  paidAmountCents: event.type === 'payment_recorded' ? event.amountCents ?? 0 : 0,
  balanceAmountCents: 0,
  paymentCount: event.type === 'payment_recorded' ? 1 : 0,
  lastPaymentDate: event.type === 'payment_recorded' ? event.createdAt : null,
  extrasSummary: event.description ?? event.type,
  notes: event.status,
})
