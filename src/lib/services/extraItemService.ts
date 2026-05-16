import {
  addExtraItemToAccount,
  createExtraItemCatalogEntry,
  deactivateExtraItemCatalogEntry,
  getActiveExtraItemCatalog,
  getExtraItemsForAccount,
  recalculateAccountTotalWithExtras,
  removeAccountExtraItem,
  seedInitialExtraItemsIfMissing,
  updateAccountExtraItem,
  updateExtraItemCatalogEntry,
} from '../db/extraItemRepository'
import { initializeBeachDatabase } from '../db/beachRepository'
import type { BeachState } from '../types/db'
import type {
  AccountExtraItem,
  AccountExtraItemInput,
  ExtraItemCatalogEntry,
  ExtraItemCatalogInput,
} from '../types/extraItem'
import { loadBeachState } from './beachLayoutService'

export const loadExtraItemCatalog = async (): Promise<ExtraItemCatalogEntry[]> => {
  await initializeBeachDatabase()
  await seedInitialExtraItemsIfMissing()
  return getActiveExtraItemCatalog()
}

export const saveExtraItemCatalogEntry = async (
  input: ExtraItemCatalogInput,
  id?: string,
): Promise<ExtraItemCatalogEntry> => {
  if (id) return updateExtraItemCatalogEntry(id, input)
  return createExtraItemCatalogEntry(input)
}

export const removeExtraItemCatalogEntry = async (id: string): Promise<void> => {
  return deactivateExtraItemCatalogEntry(id)
}

export const loadAccountExtraItems = async (accountId: string): Promise<AccountExtraItem[]> => {
  return getExtraItemsForAccount(accountId)
}

export const addAccountExtraItemAndReload = async (
  accountId: string,
  input: AccountExtraItemInput,
): Promise<BeachState> => {
  await addExtraItemToAccount(accountId, input)
  await recalculateAccountTotalWithExtras(accountId)
  return loadBeachState()
}

export const updateAccountExtraItemAndReload = async (
  id: string,
  input: AccountExtraItemInput,
): Promise<BeachState> => {
  await updateAccountExtraItem(id, input)
  return loadBeachState()
}

export const removeAccountExtraItemAndReload = async (id: string): Promise<BeachState> => {
  await removeAccountExtraItem(id)
  return loadBeachState()
}
