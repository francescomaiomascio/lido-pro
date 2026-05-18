import type {
  AvailabilityLockInput,
  AvailabilityLockRecord,
  BookingConflictInput,
  BookingConflictRecord,
  BookingFolioLinkInput,
  BookingFolioLinkRecord,
  BookingRegistryEventLinkInput,
  BookingRegistryEventLinkRecord,
  BookingCustomerPairingCandidateRecord,
  BookingCustomerPairingDecision,
  BookingCustomerPairingStatus,
  BookingRequestInput,
  BookingRequestRecord,
  BookingRequestStatus,
  BookingStatusEventInput,
  BookingStatusEventRecord,
  PricingSnapshotInput,
  PricingSnapshotRecord,
} from '../booking/bookingPersistence.types'
import { getBeachDatabase } from './database'

export const listBookingRequests = async (): Promise<BookingRequestRecord[]> => {
  return getBeachDatabase().listBookingRequests()
}

export const createBookingRequest = async (
  input: BookingRequestInput,
): Promise<BookingRequestRecord> => {
  return getBeachDatabase().createBookingRequest(input)
}

export const getBookingRequestById = async (
  requestId: string,
): Promise<BookingRequestRecord | null> => {
  return getBeachDatabase().getBookingRequestById(requestId)
}

export const updateBookingRequestStatus = async (
  requestId: string,
  status: BookingRequestStatus,
): Promise<BookingRequestRecord> => {
  return getBeachDatabase().updateBookingRequestStatus(requestId, status)
}

export const listPairingCandidates = async (
  requestId: string,
): Promise<BookingCustomerPairingCandidateRecord[]> => {
  return getBeachDatabase().listPairingCandidates(requestId)
}

export const replacePairingCandidates = async (
  requestId: string,
  candidates: BookingCustomerPairingCandidateRecord[],
): Promise<BookingCustomerPairingCandidateRecord[]> => {
  return getBeachDatabase().replacePairingCandidates(requestId, candidates)
}

export const updateBookingRequestPairingStatus = async (
  requestId: string,
  pairingStatus: BookingCustomerPairingStatus,
): Promise<BookingRequestRecord> => {
  return getBeachDatabase().updateBookingRequestPairingStatus(requestId, pairingStatus)
}

export const resolveBookingRequestPairing = async (
  decision: BookingCustomerPairingDecision,
): Promise<BookingRequestRecord> => {
  return getBeachDatabase().resolveBookingRequestPairing(decision)
}

export const listBookingStatusEvents = async (filters?: {
  reservationId?: string
  requestId?: string
}): Promise<BookingStatusEventRecord[]> => {
  return getBeachDatabase().listBookingStatusEvents(filters)
}

export const appendBookingStatusEvent = async (
  input: BookingStatusEventInput,
): Promise<BookingStatusEventRecord> => {
  return getBeachDatabase().appendBookingStatusEvent(input)
}

export const listBookingConflicts = async (filters?: {
  reservationId?: string
  requestId?: string
  status?: BookingConflictRecord['status']
}): Promise<BookingConflictRecord[]> => {
  return getBeachDatabase().listBookingConflicts(filters)
}

export const createBookingConflict = async (
  input: BookingConflictInput,
): Promise<BookingConflictRecord> => {
  return getBeachDatabase().createBookingConflict(input)
}

export const resolveBookingConflict = async (
  conflictId: string,
): Promise<BookingConflictRecord> => {
  return getBeachDatabase().resolveBookingConflict(conflictId)
}

export const listAvailabilityLocks = async (filters?: {
  itemId?: string
  status?: AvailabilityLockRecord['status']
}): Promise<AvailabilityLockRecord[]> => {
  return getBeachDatabase().listAvailabilityLocks(filters)
}

export const createAvailabilityLock = async (
  input: AvailabilityLockInput,
): Promise<AvailabilityLockRecord> => {
  return getBeachDatabase().createAvailabilityLock(input)
}

export const releaseAvailabilityLock = async (
  lockId: string,
): Promise<AvailabilityLockRecord> => {
  return getBeachDatabase().releaseAvailabilityLock(lockId)
}

export const createPricingSnapshot = async (
  input: PricingSnapshotInput,
): Promise<PricingSnapshotRecord> => {
  return getBeachDatabase().createPricingSnapshot(input)
}

export const getPricingSnapshotById = async (
  snapshotId: string,
): Promise<PricingSnapshotRecord | null> => {
  return getBeachDatabase().getPricingSnapshotById(snapshotId)
}

export const linkBookingFolio = async (
  input: BookingFolioLinkInput,
): Promise<BookingFolioLinkRecord> => {
  return getBeachDatabase().linkBookingFolio(input)
}

export const linkBookingRegistryEvent = async (
  input: BookingRegistryEventLinkInput,
): Promise<BookingRegistryEventLinkRecord> => {
  return getBeachDatabase().linkBookingRegistryEvent(input)
}
