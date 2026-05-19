import { getBeachDatabase } from './database'
import type {
  RegistryEvent,
  RegistryEventFilter,
  RegistryEventInput,
} from '../registry/registryEvent.types'

export const appendRegistryEvent = async (input: RegistryEventInput): Promise<RegistryEvent> => {
  return getBeachDatabase().appendRegistryEvent(input)
}

export const listRegistryEvents = async (filter: RegistryEventFilter = {}): Promise<RegistryEvent[]> => {
  return getBeachDatabase().listRegistryEvents(filter)
}

export const getRegistryEventById = async (id: string): Promise<RegistryEvent | null> => {
  return getBeachDatabase().getRegistryEventById(id)
}

export const acknowledgeRegistryEvent = async (id: string): Promise<RegistryEvent> => {
  return getBeachDatabase().acknowledgeRegistryEvent(id)
}

export const resolveRegistryEvent = async (id: string): Promise<RegistryEvent> => {
  return getBeachDatabase().resolveRegistryEvent(id)
}

export const voidRegistryEvent = async (id: string, reason?: string | null): Promise<RegistryEvent> => {
  return getBeachDatabase().voidRegistryEvent(id, reason)
}

export const findRegistryEventByDedupeKey = async (
  dedupeKey: string,
): Promise<RegistryEvent | null> => {
  return getBeachDatabase().findRegistryEventByDedupeKey(dedupeKey)
}
