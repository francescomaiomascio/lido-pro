import type { BookingPeriodType } from './bookingDomain.types'

export type BookingPeriodInput = {
  id?: string | null
  type: BookingPeriodType
  startDate: string
  endDate?: string | null
  startTime?: string | null
  endTime?: string | null
  label?: string | null
}

export type NormalizedBookingPeriod = {
  id: string
  type: BookingPeriodType
  startDate: string
  endDate: string
  startTime?: string | null
  endTime?: string | null
  label: string
}

export type BookingPeriodValidation = {
  valid: boolean
  errors: Array<'missing_start_date' | 'missing_end_date' | 'invalid_range' | 'missing_time'>
}

export type BookingPeriodComparison = {
  sameType: boolean
  sameDates: boolean
  sameTimes: boolean
  changed: boolean
}
