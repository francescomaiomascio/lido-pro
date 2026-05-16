import type { ParametricLayoutBundle } from '../map-canvas/parametric/parametricLayoutTypes'
import type {
  BeachItemStatus,
  BeachItemUsageType,
  BeachLayout,
  BeachItem,
  BeachItemStatusEvent,
  BeachStatusSummary,
} from '../types/beach'
import {
  getBeachDatabase,
  resetBrowserDatabaseForDevelopmentOnly as resetBrowserDatabaseAdapterForDevelopmentOnly,
} from './database'

export const initializeBeachDatabase = async (): Promise<void> => {
  await getBeachDatabase().initialize()
}

export const getActiveLayout = async (): Promise<BeachLayout> => {
  return getBeachDatabase().getActiveLayout()
}

export const getBeachItems = async (layoutId: string): Promise<BeachItem[]> => {
  return getBeachDatabase().getBeachItems(layoutId)
}

export const updateBeachItemStatus = async (
  itemId: string,
  status: BeachItemStatus,
): Promise<void> => {
  await getBeachDatabase().updateBeachItemStatus(itemId, status)
}

export const updateBeachItemUsageType = async (
  itemId: string,
  usageType: BeachItemUsageType,
): Promise<void> => {
  await getBeachDatabase().updateBeachItemUsageType(itemId, usageType)
}

export const updateBeachItemOperationalNote = async (
  itemId: string,
  note: string,
): Promise<void> => {
  await getBeachDatabase().updateBeachItemOperationalNote(itemId, note)
}

export const getBeachItemStatusEvents = async (
  itemId: string,
): Promise<BeachItemStatusEvent[]> => {
  return getBeachDatabase().getBeachItemStatusEvents(itemId)
}

export const getBeachStatusSummary = async (layoutId: string): Promise<BeachStatusSummary> => {
  return getBeachDatabase().getBeachStatusSummary(layoutId)
}

export const ensureParametricLayoutImported = async (): Promise<void> => {
  await getBeachDatabase().ensureParametricLayoutImported()
}

export const getActiveParametricLayoutBundle = async (): Promise<ParametricLayoutBundle | null> => {
  return getBeachDatabase().getActiveParametricLayoutBundle()
}

export const getDraftParametricLayoutBundle = async (): Promise<ParametricLayoutBundle | null> => {
  return getBeachDatabase().getDraftParametricLayoutBundle()
}

export const getParametricLayoutBundle = async (versionId: string): Promise<ParametricLayoutBundle | null> => {
  return getBeachDatabase().getParametricLayoutBundle(versionId)
}

export const getParametricLayoutVersions = async (): Promise<ParametricLayoutBundle['version'][]> => {
  return getBeachDatabase().getParametricLayoutVersions()
}

export const deleteDraftParametricLayout = async (versionId: string): Promise<void> => {
  await getBeachDatabase().deleteDraftParametricLayout(versionId)
}

export const activateDraftParametricLayout = async (versionId: string): Promise<void> => {
  await getBeachDatabase().activateDraftParametricLayout(versionId)
}

export const restoreArchivedParametricLayout = async (versionId: string): Promise<ParametricLayoutBundle> => {
  return getBeachDatabase().restoreArchivedParametricLayout(versionId)
}

export const createParametricDraftFromActive = async (): Promise<ParametricLayoutBundle> => {
  return getBeachDatabase().createParametricDraftFromActive()
}

// Development-only helper. Do not expose this in the normal UI.
export const resetSeedForDevelopmentOnly = async (): Promise<void> => {
  await getBeachDatabase().resetSeedForDevelopmentOnly()
}

export const resetBrowserDatabaseForDevelopmentOnly = async (): Promise<void> => {
  await resetBrowserDatabaseAdapterForDevelopmentOnly()
}

export const getDatabaseRuntime = () => getBeachDatabase().runtime
