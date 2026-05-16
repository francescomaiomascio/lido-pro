const timeFormatter = new Intl.DateTimeFormat('it-IT', {
  hour: '2-digit',
  minute: '2-digit',
})

const dayFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
})

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export const formatCompactDateTime = (value: string | null): string => {
  if (!value) {
    return 'Mai'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Non disponibile'
  }

  const now = new Date()

  if (isSameDay(date, now)) {
    return `oggi ${timeFormatter.format(date)}`
  }

  if (isSameDay(date, addDays(now, -1))) {
    return `ieri ${timeFormatter.format(date)}`
  }

  return `${dayFormatter.format(date)} ${timeFormatter.format(date)}`
}
