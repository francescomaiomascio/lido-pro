export const formatEuroFromCents = (cents: number): string =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)

export const parseEuroToCents = (input: string): number => {
  const normalized = input.trim().replace(/\s/g, '').replace('€', '').replace(',', '.')

  if (!normalized) {
    return Number.NaN
  }

  const value = Number(normalized)

  if (!Number.isFinite(value)) {
    return Number.NaN
  }

  return Math.round(value * 100)
}
