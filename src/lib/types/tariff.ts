export type TariffItemType = 'palm' | 'umbrella' | 'small_palm'
export type TariffReservationType = 'daily' | 'seasonal'

export type TariffRuleInput = {
  name: string
  itemType: TariffItemType
  rowLabel?: string | null
  reservationType: TariffReservationType
  amountCents: number
  seasonYear?: number | null
  validFrom?: string | null
  validTo?: string | null
  priority?: number
  notes?: string | null
}

export interface TariffRule {
  id: string
  name: string
  itemType: TariffItemType
  rowLabel?: string | null
  reservationType: TariffReservationType
  amountCents: number
  currency: 'EUR'
  seasonYear?: number | null
  validFrom?: string | null
  validTo?: string | null
  priority: number
  active: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface PriceSuggestion {
  tariffRule: TariffRule | null
  amountCents: number
  reason: string
  confidence: 'exact' | 'fallback' | 'none'
}
