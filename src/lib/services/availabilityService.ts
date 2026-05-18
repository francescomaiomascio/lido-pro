export {
  BLOCKING_RESERVATION_STATUSES,
  NON_BLOCKING_RESERVATION_STATUSES,
  canConfirmBooking,
  checkItemAvailability,
  detectBookingConflicts,
  explainAvailability,
  getAvailabilityForDate,
  getAvailabilityForRange,
  getAvailableItems,
} from '../booking/availabilityService'

export type {
  AvailabilityCollectionInput,
  CheckItemAvailabilityInput,
  DetectBookingConflictsInput,
} from '../booking/availabilityService'
