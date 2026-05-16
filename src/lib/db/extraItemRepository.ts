import { getBeachDatabase } from './database'
import type {
  AccountExtraItem,
  AccountExtraItemInput,
  ExtraItemCatalogEntry,
  ExtraItemCatalogInput,
} from '../types/extraItem'
import type { Account } from '../types/account'

export const seedInitialExtraItemsIfMissing = async (): Promise<void> => {
  return getBeachDatabase().seedInitialExtraItemsIfMissing()
}

export const getActiveExtraItemCatalog = async (): Promise<ExtraItemCatalogEntry[]> => {
  return getBeachDatabase().getActiveExtraItemCatalog()
}

export const createExtraItemCatalogEntry = async (
  input: ExtraItemCatalogInput,
): Promise<ExtraItemCatalogEntry> => {
  return getBeachDatabase().createExtraItemCatalogEntry(input)
}

export const updateExtraItemCatalogEntry = async (
  id: string,
  input: ExtraItemCatalogInput,
): Promise<ExtraItemCatalogEntry> => {
  return getBeachDatabase().updateExtraItemCatalogEntry(id, input)
}

export const deactivateExtraItemCatalogEntry = async (id: string): Promise<void> => {
  return getBeachDatabase().deactivateExtraItemCatalogEntry(id)
}

export const addExtraItemToAccount = async (
  accountId: string,
  input: AccountExtraItemInput,
): Promise<AccountExtraItem> => {
  return getBeachDatabase().addExtraItemToAccount(accountId, input)
}

export const updateAccountExtraItem = async (
  id: string,
  input: AccountExtraItemInput,
): Promise<AccountExtraItem> => {
  return getBeachDatabase().updateAccountExtraItem(id, input)
}

export const removeAccountExtraItem = async (id: string): Promise<void> => {
  return getBeachDatabase().removeAccountExtraItem(id)
}

export const getExtraItemsForAccount = async (accountId: string): Promise<AccountExtraItem[]> => {
  return getBeachDatabase().getExtraItemsForAccount(accountId)
}

export const seedInitialIncludedItemsIfMissing = async (): Promise<void> => {
  await getBeachDatabase().seedInitialIncludedItemsIfMissing()
}

export const getIncludedItemsForTariffContext = async (
  itemType: string,
  rowLabel: string | null,
  reservationType: string,
) => {
  return getBeachDatabase().getIncludedItemsForTariffContext(itemType, rowLabel, reservationType)
}

export const recalculateAccountTotalWithExtras = async (accountId: string): Promise<Account> => {
  return getBeachDatabase().recalculateAccountTotalWithExtras(accountId)
}
