import type { CustomerInput } from '../types/customer'

export const normalizeCustomerInput = (input: CustomerInput): CustomerInput => ({
  fullName: input.fullName.trim(),
  phone: input.phone?.trim() || null,
  email: input.email?.trim() || null,
  notes: input.notes?.trim() || null,
})

export const validateCustomerInput = (input: CustomerInput): string | null => {
  const normalized = normalizeCustomerInput(input)

  if (!normalized.fullName) {
    return 'Nome e cognome obbligatorio'
  }

  if (!normalized.phone && !normalized.email) {
    return 'Inserisci almeno telefono o email'
  }

  return null
}
