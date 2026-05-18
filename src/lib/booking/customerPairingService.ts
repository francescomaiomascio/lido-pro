import {
  getBookingRequestById,
  listPairingCandidates,
  replacePairingCandidates,
  resolveBookingRequestPairing,
  updateBookingRequestPairingStatus,
} from '../db/bookingRepository'
import { getActiveCustomers } from '../db/customerRepository'
import { createCustomer } from '../services/customerService'
import type { Customer } from '../types/customer'
import type {
  CustomerPairingCandidate,
  CustomerPairingStatus,
  CustomerPayload,
  PairingDecision,
  PairingResult,
} from './customerPairing.types'
import { normalizeEmail, normalizeName, normalizePhone, safeString } from './customerPairingNormalize'
import { scoreCustomerPairingCandidate } from './customerPairingScorer'

const hasPayloadSignal = (payload: CustomerPayload): boolean =>
  Boolean(
    normalizeName(payload.fullName ?? payload.name) ||
      normalizeName([payload.firstName, payload.lastName].map(safeString).filter(Boolean).join(' ')) ||
      normalizePhone(payload.phone) ||
      normalizeEmail(payload.email),
  )

const hasCustomerCreatePayload = (payload: CustomerPayload): boolean =>
  Boolean(
    normalizeName(payload.fullName ?? payload.name) ||
      (normalizeName(payload.firstName) && normalizeName(payload.lastName)),
  )

const sortCandidates = (candidates: CustomerPairingCandidate[]) =>
  candidates.toSorted((a, b) => b.score - a.score || a.existingCustomerId.localeCompare(b.existingCustomerId))

const getRecommendedCandidateId = (candidates: CustomerPairingCandidate[]): string | null => {
  const best = sortCandidates(candidates)[0]
  if (!best || best.confidence !== 'high') {
    return null
  }
  const hasStrongIdentityReason = best.reasons.some((reason) =>
    ['phone_exact', 'phone_normalized', 'email_exact'].includes(reason),
  )
  return hasStrongIdentityReason ? best.id : null
}

const statusForPayload = (
  payload: CustomerPayload,
  candidates: CustomerPairingCandidate[],
): CustomerPairingStatus => {
  if (candidates.length > 0) {
    return 'candidates_found'
  }
  if (!hasPayloadSignal(payload)) {
    return 'unpaired'
  }
  return hasCustomerCreatePayload(payload) ? 'new_customer_required' : 'unpaired'
}

const buildWarnings = (
  payload: CustomerPayload,
  candidates: CustomerPairingCandidate[],
): string[] => {
  const warnings: string[] = []
  if (!normalizePhone(payload.phone) && !normalizeEmail(payload.email)) {
    warnings.push('No phone or email was provided; name-only matches must be reviewed manually.')
  }
  if (candidates.some((candidate) => candidate.confidence === 'high') && candidates.length > 1) {
    warnings.push('Multiple candidates were found; operator confirmation is required.')
  }
  return warnings
}

const scoreAgainstCustomers = (
  requestId: string,
  payload: CustomerPayload,
  customers: Customer[],
): CustomerPairingCandidate[] => {
  const createdAt = new Date().toISOString()
  return sortCandidates(
    customers
      .map((customer) =>
        scoreCustomerPairingCandidate({
          requestId,
          payload,
          customer,
          createdAt,
        }),
      )
      .filter((candidate): candidate is CustomerPairingCandidate => candidate !== null),
  )
}

export const previewPairingCandidates = async (
  payload: CustomerPayload,
): Promise<PairingResult> => {
  const requestId = 'preview'
  const customers = await getActiveCustomers()
  const candidates = scoreAgainstCustomers(requestId, payload, customers)
  return {
    requestId,
    status: statusForPayload(payload, candidates),
    candidates,
    recommendedCandidateId: getRecommendedCandidateId(candidates),
    warnings: buildWarnings(payload, candidates),
  }
}

export const generatePairingCandidates = async (
  requestId: string,
): Promise<PairingResult> => {
  const request = await getBookingRequestById(requestId)
  if (!request) {
    throw new Error('Booking request not found.')
  }

  const payload = request.customerPayload as CustomerPayload
  const customers = await getActiveCustomers()
  const candidates = scoreAgainstCustomers(requestId, payload, customers)
  const storedCandidates = await replacePairingCandidates(requestId, candidates)
  const status = statusForPayload(payload, storedCandidates)
  await updateBookingRequestPairingStatus(requestId, status)

  return {
    requestId,
    status,
    candidates: storedCandidates,
    recommendedCandidateId: getRecommendedCandidateId(storedCandidates),
    warnings: buildWarnings(payload, storedCandidates),
  }
}

export const decidePairing = async (decision: PairingDecision) => {
  let resolvedDecision = decision

  if (decision.decision === 'match_existing' && !decision.existingCustomerId) {
    throw new Error('Existing customer id is required for match_existing.')
  }

  if (decision.decision === 'create_new') {
    if (!decision.newCustomerInput) {
      throw new Error('Customer input is required for create_new.')
    }
    const createdCustomer = await createCustomer(decision.newCustomerInput)
    resolvedDecision = {
      ...decision,
      existingCustomerId: createdCustomer.id,
    }
  }

  return resolveBookingRequestPairing({
    ...resolvedDecision,
    decidedAt: resolvedDecision.decidedAt ?? new Date().toISOString(),
  })
}

export const getPairingState = async (requestId: string): Promise<PairingResult> => {
  const request = await getBookingRequestById(requestId)
  if (!request) {
    throw new Error('Booking request not found.')
  }
  const candidates = await listPairingCandidates(requestId)
  return {
    requestId,
    status: request.pairingStatus as CustomerPairingStatus,
    candidates,
    recommendedCandidateId: getRecommendedCandidateId(candidates),
    warnings: buildWarnings(request.customerPayload as CustomerPayload, candidates),
  }
}
