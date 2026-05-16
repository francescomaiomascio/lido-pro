import { getBeachDatabase } from './database'
import type { BeachItem } from '../types/beach'
import type {
  PriceSuggestion,
  TariffReservationType,
  TariffRule,
  TariffRuleInput,
} from '../types/tariff'

export const seedInitialTariffsIfMissing = async (): Promise<void> => {
  await getBeachDatabase().seedInitialTariffsIfMissing()
}

export const getActiveTariffRules = async (): Promise<TariffRule[]> => {
  return getBeachDatabase().getActiveTariffRules()
}

export const getTariffRule = async (tariffRuleId: string): Promise<TariffRule | null> => {
  return getBeachDatabase().getTariffRule(tariffRuleId)
}

export const createTariffRule = async (input: TariffRuleInput): Promise<TariffRule> => {
  return getBeachDatabase().createTariffRule(input)
}

export const updateTariffRule = async (
  tariffRuleId: string,
  input: TariffRuleInput,
): Promise<TariffRule> => {
  return getBeachDatabase().updateTariffRule(tariffRuleId, input)
}

export const deactivateTariffRule = async (tariffRuleId: string): Promise<void> => {
  await getBeachDatabase().deactivateTariffRule(tariffRuleId)
}

export const suggestPriceForItem = async (
  item: BeachItem,
  reservationType: TariffReservationType,
  date?: string,
): Promise<PriceSuggestion> => {
  return getBeachDatabase().suggestPriceForItem(item, reservationType, date)
}
