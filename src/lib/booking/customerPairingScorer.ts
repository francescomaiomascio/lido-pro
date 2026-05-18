import type { Customer } from '../types/customer'
import type {
  CustomerPairingCandidate,
  CustomerPairingConfidence,
  CustomerPayload,
  PairingReason,
} from './customerPairing.types'
import { compareNames, normalizeEmail, normalizeName, normalizePhone, safeString } from './customerPairingNormalize'

export type CustomerPairingScoreInput = {
  requestId: string
  payload: CustomerPayload
  customer: Customer
  createdAt: string
  previousBookingHint?: boolean
  manualHint?: boolean
}

const confidenceForScore = (score: number): CustomerPairingConfidence => {
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

const getPayloadName = (payload: CustomerPayload): string => {
  const fullName = safeString(payload.fullName ?? payload.name)
  if (fullName) return fullName
  return [payload.firstName, payload.lastName].map(safeString).filter(Boolean).join(' ')
}

const addReason = (
  reasons: PairingReason[],
  matchedFields: string[],
  reason: PairingReason,
  field: string,
) => {
  if (!reasons.includes(reason)) reasons.push(reason)
  if (!matchedFields.includes(field)) matchedFields.push(field)
}

export const scoreCustomerPairingCandidate = (
  input: CustomerPairingScoreInput,
): CustomerPairingCandidate | null => {
  const reasons: PairingReason[] = []
  const matchedFields: string[] = []
  let score = 0

  const payloadPhoneRaw = safeString(input.payload.phone)
  const customerPhoneRaw = safeString(input.customer.phone)
  const payloadPhone = normalizePhone(payloadPhoneRaw)
  const customerPhone = normalizePhone(customerPhoneRaw)
  if (payloadPhoneRaw && customerPhoneRaw && payloadPhoneRaw === customerPhoneRaw) {
    score += 70
    addReason(reasons, matchedFields, 'phone_exact', 'phone')
  } else if (payloadPhone && customerPhone && payloadPhone === customerPhone) {
    score += 70
    addReason(reasons, matchedFields, 'phone_normalized', 'phone')
  }

  const payloadEmail = normalizeEmail(input.payload.email)
  const customerEmail = normalizeEmail(input.customer.email)
  if (payloadEmail && customerEmail && payloadEmail === customerEmail) {
    score += 70
    addReason(reasons, matchedFields, 'email_exact', 'email')
  }

  const payloadName = getPayloadName(input.payload)
  const customerName = input.customer.fullName
  const nameMatch = compareNames(payloadName, customerName)
  if (nameMatch === 'exact') {
    score += 30
    addReason(reasons, matchedFields, 'name_exact', 'name')
  } else if (nameMatch === 'similar') {
    const normalizedPayload = normalizeName(payloadName)
    const normalizedCustomer = normalizeName(customerName)
    score += normalizedPayload.split(' ').length > 1 && normalizedCustomer.split(' ').length > 1 ? 25 : 15
    addReason(reasons, matchedFields, 'name_similar', 'name')
  }

  if (input.previousBookingHint) {
    score += 10
    addReason(reasons, matchedFields, 'previous_booking', 'booking_history')
  }

  if (input.manualHint) {
    score += 10
    addReason(reasons, matchedFields, 'manual_hint', 'manual_hint')
  }

  if (score <= 0) {
    return null
  }

  return {
    id: `${input.requestId}-${input.customer.id}`,
    requestId: input.requestId,
    existingCustomerId: input.customer.id,
    score,
    confidence: confidenceForScore(score),
    reasons,
    matchedFields,
    createdAt: input.createdAt,
  }
}
