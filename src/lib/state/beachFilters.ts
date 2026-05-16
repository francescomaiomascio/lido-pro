import type { BeachItemStatus } from '../types/beach'
import type { BeachItemUsageType } from '../types/beach'

export type BeachStatusFilter = 'all' | BeachItemStatus
export type BeachUsageFilter = 'all' | BeachItemUsageType

export const statusFilters: BeachStatusFilter[] = [
  'all',
  'free',
  'occupied',
  'reserved',
  'maintenance',
]

export const usageFilters: BeachUsageFilter[] = ['all', 'daily', 'seasonal']
