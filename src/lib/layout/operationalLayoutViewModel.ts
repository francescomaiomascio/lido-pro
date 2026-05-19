import type { BeachItem } from '../types/beach'
import type { ActiveLayoutProjection, OperationalLayoutView } from './layoutProjectionBoundary'
import { createOperationalLayoutView } from './layoutProjectionBoundary'

export type OperationalLayoutItemView = {
  itemId: string
  itemKind: BeachItem['type']
  code: string
  rowLabel: string
  numberIndex: number
  currentStatus: BeachItem['status']
  usageType: BeachItem['usageType']
  availabilityState: 'not_checked'
  reservationId?: string | null
  accountId?: string | null
  customerId?: string | null
}

export type OperationalLayoutViewModel = OperationalLayoutView & {
  itemViews: OperationalLayoutItemView[]
}

export const buildOperationalLayoutViewModel = (
  projection: ActiveLayoutProjection,
): OperationalLayoutViewModel => ({
  ...createOperationalLayoutView(projection),
  itemViews: projection.items.map((item) => ({
    itemId: item.id,
    itemKind: item.type,
    code: item.code,
    rowLabel: item.rowLabel,
    numberIndex: item.numberIndex,
    currentStatus: item.status,
    usageType: item.usageType,
    availabilityState: 'not_checked',
    reservationId: item.currentReservation?.id ?? null,
    accountId: item.activeAccount?.id ?? null,
    customerId: item.assignedCustomer?.customer.id ?? item.activeAccount?.customerId ?? null,
  })),
})
