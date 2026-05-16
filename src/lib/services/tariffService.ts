import {
  createTariffRule,
  deactivateTariffRule,
  getActiveTariffRules,
  getTariffRule,
  seedInitialTariffsIfMissing,
  suggestPriceForItem,
  updateTariffRule,
} from '../db/tariffRepository'
import type { BeachItem } from '../types/beach'
import type { Reservation } from '../types/reservation'
import type {
  PriceSuggestion,
  TariffReservationType,
  TariffRule,
  TariffRuleInput,
} from '../types/tariff'

export const ensureTariffs = async (): Promise<void> => {
  await seedInitialTariffsIfMissing()
}

export const loadTariffRules = async (): Promise<TariffRule[]> => {
  await ensureTariffs()
  return getActiveTariffRules()
}

export const loadTariffRule = async (tariffRuleId: string): Promise<TariffRule | null> => {
  return getTariffRule(tariffRuleId)
}

export const saveTariffRule = async (
  tariffRuleId: string,
  input: TariffRuleInput,
): Promise<TariffRule> => {
  return updateTariffRule(tariffRuleId, input)
}

export const addTariffRule = async (input: TariffRuleInput): Promise<TariffRule> => {
  return createTariffRule(input)
}

export const removeTariffRule = async (tariffRuleId: string): Promise<void> => {
  await deactivateTariffRule(tariffRuleId)
}

export const suggestPriceForBeachItem = async (
  item: BeachItem,
  reservationType: TariffReservationType,
  date?: string,
): Promise<PriceSuggestion> => {
  await ensureTariffs()
  return suggestPriceForItem(item, reservationType, date)
}

export const suggestPriceForReservation = async (
  item: BeachItem,
  reservation: Reservation,
): Promise<PriceSuggestion> => {
  return suggestPriceForBeachItem(item, reservation.reservationType, reservation.startDate)
}
