import type { BookingPeriod } from './bookingDomain.types'
import type { AvailabilityPeriod } from './availability.types'

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export const compareDateOnly = (a: string, b: string): number => {
  const dateA = a.slice(0, 10)
  const dateB = b.slice(0, 10)
  return dateA.localeCompare(dateB)
}

export const normalizeAvailabilityPeriod = (
  period: AvailabilityPeriod | BookingPeriod,
): AvailabilityPeriod => {
  const startDate = period.startDate.slice(0, 10)
  const endDate = (period.endDate ?? period.startDate).slice(0, 10)
  const normalizedType = period.type === 'daily' && startDate !== endDate ? 'multi_day' : period.type

  return {
    type: normalizedType,
    startDate,
    endDate,
    startTime: period.startTime ?? null,
    endTime: period.endTime ?? null,
    label: period.label ?? null,
  }
}

export const isValidAvailabilityPeriod = (period: AvailabilityPeriod): boolean => {
  const normalized = normalizeAvailabilityPeriod(period)
  return (
    ISO_DATE_ONLY.test(normalized.startDate) &&
    ISO_DATE_ONLY.test(normalized.endDate ?? normalized.startDate) &&
    compareDateOnly(normalized.startDate, normalized.endDate ?? normalized.startDate) <= 0
  )
}

export const periodsOverlap = (
  a: AvailabilityPeriod | BookingPeriod,
  b: AvailabilityPeriod | BookingPeriod,
): boolean => {
  const left = normalizeAvailabilityPeriod(a)
  const right = normalizeAvailabilityPeriod(b)
  const leftEnd = left.endDate ?? left.startDate
  const rightEnd = right.endDate ?? right.startDate

  return compareDateOnly(left.startDate, rightEnd) <= 0 && compareDateOnly(right.startDate, leftEnd) <= 0
}

export const containsDate = (period: AvailabilityPeriod | BookingPeriod, date: string): boolean => {
  const normalized = normalizeAvailabilityPeriod(period)
  const endDate = normalized.endDate ?? normalized.startDate
  const day = date.slice(0, 10)

  return compareDateOnly(normalized.startDate, day) <= 0 && compareDateOnly(day, endDate) <= 0
}

export const expandDailyRange = (startDate: string, endDate: string): string[] => {
  if (!ISO_DATE_ONLY.test(startDate) || !ISO_DATE_ONLY.test(endDate) || compareDateOnly(startDate, endDate) > 0) {
    return []
  }

  const dates: string[] = []
  const cursor = new Date(`${startDate}T00:00:00.000Z`)
  const end = new Date(`${endDate}T00:00:00.000Z`)

  while (cursor.getTime() <= end.getTime()) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return dates
}
