const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric',
  month: 'short',
})

const toLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getTodayIsoDate = (): string => toLocalDate(new Date())

export const formatDateRangeItalian = (startDate: string, endDate: string): string => {
  if (startDate === endDate) {
    return dateFormatter.format(new Date(`${startDate}T00:00:00`))
  }

  return `${dateFormatter.format(new Date(`${startDate}T00:00:00`))} - ${dateFormatter.format(
    new Date(`${endDate}T00:00:00`),
  )}`
}
