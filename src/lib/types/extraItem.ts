export interface ExtraItemCatalogEntry {
  id: string
  name: string
  category?: string | null
  unitLabel: string
  defaultAmountCents: number
  maxQuantityPerBooking: number
  includedQuantityDefault: number
  active: boolean
  sortOrder: number
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface ExtraItemCatalogInput {
  name: string
  category?: string | null
  unitLabel?: string
  defaultAmountCents?: number
  maxQuantityPerBooking?: number
  includedQuantityDefault?: number
  sortOrder?: number
  notes?: string | null
}

export interface AccountExtraItem {
  id: string
  accountId: string
  catalogItemId?: string | null
  name: string
  quantity: number
  unitAmountCents: number
  totalAmountCents: number
  notes?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface AccountExtraItemInput {
  catalogItemId?: string | null
  name: string
  quantity: number
  unitAmountCents: number
  notes?: string | null
}

export interface TariffIncludedItem {
  id: string
  tariffRuleId?: string | null
  itemType: string
  rowLabel?: string | null
  reservationType: string
  catalogItemId?: string | null
  name: string
  quantity: number
  included: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}
