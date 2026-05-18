export const safeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (value == null) {
    return ''
  }
  return String(value).trim()
}

export const normalizeEmail = (input: unknown): string => safeString(input).toLowerCase()

export const normalizePhone = (input: unknown): string => {
  let value = safeString(input)
    .replace(/[\s().-]/g, '')
    .replace(/^00/, '+')

  if (value.startsWith('+39') && value.length > 3) {
    value = value.slice(3)
  }

  return value
}

export const normalizeName = (input: unknown): string =>
  safeString(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export const splitDisplayName = (input: unknown): { firstName: string; lastName: string } => {
  const parts = normalizeName(input).split(' ').filter(Boolean)
  if (parts.length === 0) {
    return { firstName: '', lastName: '' }
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

export const compareNames = (a: unknown, b: unknown): 'exact' | 'similar' | 'none' => {
  const left = normalizeName(a)
  const right = normalizeName(b)
  if (!left || !right) {
    return 'none'
  }
  if (left === right) {
    return 'exact'
  }

  const leftParts = new Set(left.split(' ').filter(Boolean))
  const rightParts = new Set(right.split(' ').filter(Boolean))
  const shared = [...leftParts].filter((part) => rightParts.has(part))

  if (shared.length >= 2) {
    return 'similar'
  }

  const leftSplit = splitDisplayName(left)
  const rightSplit = splitDisplayName(right)
  if (
    leftSplit.firstName &&
    leftSplit.lastName &&
    leftSplit.firstName === rightSplit.firstName &&
    leftSplit.lastName === rightSplit.lastName
  ) {
    return 'similar'
  }

  return 'none'
}
