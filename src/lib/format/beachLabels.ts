import type { BeachItem, BeachItemStatus, BeachItemType, BeachItemUsageType } from '../types/beach'
import { accountStatusLabels } from './accountLabels'
import { reservationTypeLabels, reservationStatusLabels } from './reservationLabels'
import { formatDateRangeItalian } from './dateRange'
import { beachStatusLabels } from './beachStatusLabels'

export { beachStatusLabels }

export const beachTypeLabels: Record<BeachItemType, string> = {
  palm: 'Palma',
  umbrella: 'Ombrellone',
  small_palm: 'Palmetta',
}

export const beachStatusOptions: BeachItemStatus[] = [
  'free',
  'occupied',
  'reserved',
  'maintenance',
]

export const beachUsageTypeLabels: Record<BeachItemUsageType, string> = {
  daily: 'Giornaliero',
  seasonal: 'Stagionale',
}

export const beachUsageTypeOptions: BeachItemUsageType[] = ['daily', 'seasonal']

export const getBeachItemTypeLabel = (type: BeachItemType): string => beachTypeLabels[type]

export const getBeachItemStatusLabel = (status: BeachItemStatus): string =>
  beachStatusLabels[status]

export const getBeachItemUsageTypeLabel = (usageType: BeachItemUsageType): string =>
  beachUsageTypeLabels[usageType]

export const getBeachItemSearchText = (item: BeachItem): string =>
  [
    item.code,
    beachTypeLabels[item.type],
    beachStatusLabels[item.status],
    beachUsageTypeLabels[item.usageType],
    item.rowLabel,
    String(item.numberIndex),
    item.assignedCustomer?.customer.fullName ?? '',
    item.assignedCustomer?.customer.phone ?? '',
    item.assignedCustomer?.assignment.assignmentType
      ? beachUsageTypeLabels[item.assignedCustomer.assignment.assignmentType]
      : '',
    item.activeAccount ? accountStatusLabels[item.activeAccount.status] : '',
    item.activeAccount?.status ?? '',
    item.currentReservation ? reservationTypeLabels[item.currentReservation.reservationType] : '',
    item.currentReservation ? reservationStatusLabels[item.currentReservation.status] : '',
    item.currentReservation
      ? formatDateRangeItalian(item.currentReservation.startDate, item.currentReservation.endDate)
      : '',
  ]
    .join(' ')
    .toLowerCase()

const typeOrder: Record<BeachItemType, number> = {
  palm: 1,
  umbrella: 2,
  small_palm: 3,
}

export const sortBeachItems = (a: BeachItem, b: BeachItem): number =>
  typeOrder[a.type] - typeOrder[b.type] ||
  a.rowIndex - b.rowIndex ||
  a.numberIndex - b.numberIndex ||
  a.code.localeCompare(b.code)

export const getDisplayCode = (item: BeachItem): string =>
  item.type === 'umbrella' ? item.code.replace(/^O/, 'OMB') : item.code

export const getMapDisplayCode = (item: BeachItem): string => item.code
