import { formatDateRangeItalian } from '../format/dateRange'
import type { ReservationType } from '../types/reservation'
import type { AvailabilityPeriod } from './availability.types'
import type { BookingUsageMode } from './bookingDomain.types'
import type {
  BookingPeriodComparison,
  BookingPeriodInput,
  BookingPeriodValidation,
  NormalizedBookingPeriod,
} from './bookingPeriod.types'

const fallbackId = (period: BookingPeriodInput) =>
  `${period.type}-${period.startDate || 'start'}-${period.endDate || period.startDate || 'end'}`

export const normalizeBookingPeriod = (
  period: BookingPeriodInput,
): NormalizedBookingPeriod => {
  const endDate = period.endDate || period.startDate
  const type = period.type === 'daily' && endDate && period.startDate !== endDate ? 'multi_day' : period.type
  const normalized: NormalizedBookingPeriod = {
    id: period.id || fallbackId({ ...period, type }),
    type,
    startDate: period.startDate,
    endDate,
    startTime: period.startTime ?? null,
    endTime: period.endTime ?? null,
    label: period.label || formatDateRangeItalian(period.startDate, endDate),
  }
  return normalized
}

export const validateBookingPeriod = (
  period: BookingPeriodInput,
): BookingPeriodValidation => {
  const errors: BookingPeriodValidation['errors'] = []
  const normalized = normalizeBookingPeriod(period)

  if (!normalized.startDate) {
    errors.push('missing_start_date')
  }
  if (!normalized.endDate) {
    errors.push('missing_end_date')
  }
  if (normalized.startDate && normalized.endDate && normalized.startDate > normalized.endDate) {
    errors.push('invalid_range')
  }
  if (normalized.type === 'custom' && (!normalized.startTime || !normalized.endTime)) {
    errors.push('missing_time')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const compareBookingPeriods = (
  current: BookingPeriodInput,
  next: BookingPeriodInput,
): BookingPeriodComparison => {
  const left = normalizeBookingPeriod(current)
  const right = normalizeBookingPeriod(next)
  const sameType = left.type === right.type
  const sameDates = left.startDate === right.startDate && left.endDate === right.endDate
  const sameTimes = left.startTime === right.startTime && left.endTime === right.endTime
  return {
    sameType,
    sameDates,
    sameTimes,
    changed: !(sameType && sameDates && sameTimes),
  }
}

export const describeBookingPeriod = (period: BookingPeriodInput): string => {
  const normalized = normalizeBookingPeriod(period)
  if (normalized.type === 'daily') return `Giornaliero · ${formatDateRangeItalian(normalized.startDate, normalized.endDate)}`
  if (normalized.type === 'multi_day') return `Giornaliero su piu giorni · ${formatDateRangeItalian(normalized.startDate, normalized.endDate)}`
  if (normalized.type === 'seasonal') return `Stagionale · ${formatDateRangeItalian(normalized.startDate, normalized.endDate)}`
  return `Personalizzato · ${formatDateRangeItalian(normalized.startDate, normalized.endDate)}`
}

export const periodToDisplayLabel = describeBookingPeriod

export const periodToAvailabilityPeriod = (
  period: BookingPeriodInput,
): AvailabilityPeriod => {
  const normalized = normalizeBookingPeriod(period)
  return {
    type: normalized.type,
    startDate: normalized.startDate,
    endDate: normalized.endDate,
    startTime: normalized.startTime,
    endTime: normalized.endTime,
    label: normalized.label,
  }
}

export const periodToReservationType = (
  period: BookingPeriodInput,
): ReservationType => {
  const normalized = normalizeBookingPeriod(period)
  return normalized.type === 'seasonal' ? 'seasonal' : 'daily'
}

export const isPeriodEditable = (input: {
  status: string
  mode: BookingUsageMode
}): boolean => {
  if (['completed', 'cancelled', 'rejected', 'expired', 'archived'].includes(input.status)) {
    return false
  }
  return input.mode === 'operator_app' || input.mode === 'client_web' || input.mode === 'client_app'
}

export const isPeriodChangeAllowed = (input: {
  status: string
  mode: BookingUsageMode
  currentPeriod: BookingPeriodInput
  proposedPeriod: BookingPeriodInput
}): boolean => {
  if (!isPeriodEditable(input)) {
    return false
  }
  const validation = validateBookingPeriod(input.proposedPeriod)
  if (!validation.valid) {
    return false
  }
  return compareBookingPeriods(input.currentPeriod, input.proposedPeriod).changed
}
