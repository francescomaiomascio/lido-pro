import { getTodayIsoDate } from '../format/dateRange'
import { businessConfig } from '../config/appConfig'

export type DatePeriod = {
  startDate: string
  endDate: string
}

const toIsoMonthDay = (year: number, month: number, day: number): string =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

export const getDefaultSeasonalPeriod = (year = new Date().getFullYear()): DatePeriod => ({
  startDate: toIsoMonthDay(year, businessConfig.season.startMonth, businessConfig.season.startDay),
  endDate: toIsoMonthDay(year, businessConfig.season.endMonth, businessConfig.season.endDay),
})

export const getDefaultDailyPeriod = (date = getTodayIsoDate()): DatePeriod => ({
  startDate: date,
  endDate: date,
})

export const isDateRangeValid = (startDate: string, endDate: string): boolean =>
  Boolean(startDate && endDate && startDate <= endDate)

export const doDateRangesOverlap = (
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean => aStart <= bEnd && bStart <= aEnd
