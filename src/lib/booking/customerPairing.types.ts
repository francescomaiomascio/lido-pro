import type { CustomerInput } from '../types/customer'

export type CustomerPairingStatus =
  | 'unpaired'
  | 'candidates_found'
  | 'matched_existing'
  | 'new_customer_required'
  | 'manually_resolved'
  | 'rejected'

export type CustomerPayload = {
  name?: string | null
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  email?: string | null
  notes?: string | null
  source?: string | null
  rawPayload?: unknown
}

export type PairingReason =
  | 'phone_exact'
  | 'phone_normalized'
  | 'email_exact'
  | 'name_exact'
  | 'name_similar'
  | 'previous_booking'
  | 'manual_hint'

export type CustomerPairingConfidence = 'low' | 'medium' | 'high'

export type CustomerPairingCandidate = {
  id: string
  requestId: string
  existingCustomerId: string
  score: number
  confidence: CustomerPairingConfidence
  reasons: PairingReason[]
  matchedFields: string[]
  createdAt: string
}

export type PairingDecision = {
  requestId: string
  decision: 'match_existing' | 'create_new' | 'leave_unpaired' | 'reject'
  existingCustomerId?: string | null
  newCustomerInput?: CustomerInput | null
  reason?: string | null
  decidedBy?: string | null
  decidedAt?: string
}

export type PairingResult = {
  requestId: string
  status: CustomerPairingStatus
  candidates: CustomerPairingCandidate[]
  recommendedCandidateId?: string | null
  warnings: string[]
}
