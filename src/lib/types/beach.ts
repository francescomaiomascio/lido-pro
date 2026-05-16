import type { Account } from './account'
import type { BeachItemAssignedCustomer } from './customer'
import type { Reservation } from './reservation'

export type BeachItemType = 'palm' | 'umbrella' | 'small_palm'

export type BeachItemStatus = 'free' | 'occupied' | 'reserved' | 'maintenance'

export type BeachItemUsageType = 'daily' | 'seasonal'

export interface BeachLayout {
  id: string
  name: string
  widthM: number
  depthM: number
  isActive: boolean
}

export interface BeachItem {
  id: string
  layoutId: string
  code: string
  type: BeachItemType
  rowLabel: string
  rowIndex: number
  numberIndex: number
  xM: number
  yM: number
  widthM: number
  heightM: number
  rotationDeg: number
  status: BeachItemStatus
  usageType: BeachItemUsageType
  operationalNote: string
  statusUpdatedAt: string | null
  active: boolean
  assignedCustomer?: BeachItemAssignedCustomer | null
  activeAccount?: Account | null
  currentReservation?: Reservation | null
}

export interface BeachItemStatusEvent {
  id: string
  itemId: string
  previousStatus: BeachItemStatus | null
  nextStatus: BeachItemStatus
  note: string
  createdAt: string
}

export interface BeachStatusSummary {
  total: number
  daily: number
  seasonal: number
  free: number
  occupied: number
  reserved: number
  maintenance: number
}
