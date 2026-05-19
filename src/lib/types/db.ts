import type { ParametricLayoutOutput } from '../map-canvas/parametric/parametricLayoutEngine'
import type { ParametricLayoutBundle } from '../map-canvas/parametric/parametricLayoutTypes'
import type { ParametricSetupState } from '../map-canvas/parametric/parametricSetupState'
import type {
  BeachItem,
  BeachItemStatus,
  BeachItemStatusEvent,
  BeachItemUsageType,
  BeachLayout,
  BeachStatusSummary,
} from './beach'
import type {
  BeachItemAssignedCustomer,
  Customer,
  CustomerAssignmentType,
  CustomerInput,
  BeachItemCustomerAssignment,
} from './customer'
import type {
  Account,
  AccountInput,
  Payment,
  PaymentSchedule,
  PaymentScheduleInput,
  PaymentMethod,
} from './account'
import type { Reservation, ReservationInput } from './reservation'
import type { PriceSuggestion, TariffRule, TariffRuleInput, TariffReservationType } from './tariff'
import type {
  AccountExtraItem,
  AccountExtraItemInput,
  ExtraItemCatalogEntry,
  ExtraItemCatalogInput,
  TariffIncludedItem,
} from './extraItem'
import type {
  RegistryEvent,
  RegistryEventFilter,
  RegistryEventInput,
} from '../registry/registryEvent.types'
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
  BookingChangeRequestInput,
  BookingChangeRequestRecord,
  PricingSnapshotInput,
  PricingSnapshotRecord,
} from '../booking/bookingPersistence.types'

export type DatabaseRuntime = 'native-sqlite' | 'web-persistent-sqlite' | 'browser-memory-fallback'

export type DatabaseTableCategory =
  | 'layout'
  | 'booking'
  | 'clienti'
  | 'conti'
  | 'pagamenti'
  | 'articoli'
  | 'registro'
  | 'staff'
  | 'sync-dev'
  | 'system'

export type DatabaseTableSummary = {
  name: string
  category: DatabaseTableCategory
  rowCount: number
}

export type DatabaseTableReadOptions = {
  limit?: number
  offset?: number
}

export type DatabaseTableRows = {
  tableName: string
  category: DatabaseTableCategory
  rowCount: number
  limit: number
  offset: number
  rows: Record<string, unknown>[]
  refreshedAt: string
}

export type DatabaseDiagnostics = {
  runtime: DatabaseRuntime
  databaseName: string
  schemaVersion: number
  tables: DatabaseTableSummary[]
  totalVisibleRows: number
  refreshedAt: string
}

export type BeachDatabaseAdapter = {
  runtime: DatabaseRuntime
  initialize(): Promise<void>
  getDatabaseDiagnostics(): Promise<DatabaseDiagnostics>
  listDatabaseTables(): Promise<DatabaseTableSummary[]>
  getTableRowCount(tableName: string): Promise<number>
  readTableRows(tableName: string, options?: DatabaseTableReadOptions): Promise<DatabaseTableRows>
  getActiveLayout(): Promise<BeachLayout>
  getBeachItems(layoutId: string): Promise<BeachItem[]>
  updateBeachItemStatus(itemId: string, status: BeachItemStatus): Promise<void>
  updateBeachItemUsageType(itemId: string, usageType: BeachItemUsageType): Promise<void>
  updateBeachItemOperationalNote(itemId: string, note: string): Promise<void>
  getBeachItemStatusEvents(itemId: string): Promise<BeachItemStatusEvent[]>
  getBeachStatusSummary(layoutId: string): Promise<BeachStatusSummary>
  ensureParametricLayoutImported(): Promise<void>
  getActiveParametricLayoutBundle(): Promise<ParametricLayoutBundle | null>
  getDraftParametricLayoutBundle(): Promise<ParametricLayoutBundle | null>
  getParametricLayoutBundle(versionId: string): Promise<ParametricLayoutBundle | null>
  getParametricLayoutVersions(): Promise<ParametricLayoutBundle['version'][]>
  createParametricDraftFromActive(): Promise<ParametricLayoutBundle>
  deleteDraftParametricLayout(versionId: string): Promise<void>
  activateDraftParametricLayout(versionId: string): Promise<void>
  restoreArchivedParametricLayout(versionId: string): Promise<ParametricLayoutBundle>
  loadParametricSetupDraft(versionId: string): Promise<ParametricSetupState>
  saveParametricSetupDraft(state: ParametricSetupState): Promise<void>
  calculateAndSaveParametricDraft(state: ParametricSetupState): Promise<ParametricLayoutOutput>
  createCustomer(input: CustomerInput): Promise<Customer>
  updateCustomer(customerId: string, input: CustomerInput): Promise<Customer>
  getCustomer(customerId: string): Promise<Customer | null>
  searchCustomers(query: string): Promise<Customer[]>
  getActiveCustomers(): Promise<Customer[]>
  assignCustomerToBeachItem(
    itemId: string,
    customerId: string,
    assignmentType: CustomerAssignmentType,
    note?: string,
  ): Promise<void>
  unassignCustomerFromBeachItem(itemId: string): Promise<void>
  getAssignedCustomerForItem(itemId: string): Promise<BeachItemAssignedCustomer | null>
  getAssignedCustomersForItems(itemIds: string[]): Promise<BeachItemAssignedCustomer[]>
  getCustomerAssignments(customerId: string): Promise<BeachItemCustomerAssignment[]>
  createAccountForAssignment(input: AccountInput): Promise<Account>
  getAccount(accountId: string): Promise<Account | null>
  getActiveAccountForItem(itemId: string): Promise<Account | null>
  getActiveAccountsForItems(itemIds: string[]): Promise<Account[]>
  getAccountsForCustomer(customerId: string): Promise<Account[]>
  updateAccountTotal(accountId: string, totalAmountCents: number, notes?: string | null): Promise<Account>
  addPayment(
    accountId: string,
    amountCents: number,
    paymentMethod: PaymentMethod,
    note?: string,
  ): Promise<Payment>
  getPaymentsForAccount(accountId: string): Promise<Payment[]>
  recalculateAccountBalance(accountId: string): Promise<Account>
  closeAccount(accountId: string): Promise<Account>
  cancelAccount(accountId: string): Promise<Account>
  createReservation(input: ReservationInput): Promise<Reservation>
  updateReservation(reservationId: string, input: ReservationInput): Promise<Reservation>
  cancelReservation(reservationId: string): Promise<Reservation>
  getReservation(reservationId: string): Promise<Reservation | null>
  getReservationsForItem(itemId: string): Promise<Reservation[]>
  getActiveReservationsForItem(itemId: string): Promise<Reservation[]>
  getReservationsForCustomer(customerId: string): Promise<Reservation[]>
  getReservationsByDateRange(startDate: string, endDate: string): Promise<Reservation[]>
  checkItemAvailability(
    itemId: string,
    startDate: string,
    endDate: string,
    excludeReservationId?: string,
  ): Promise<boolean>
  getCurrentReservationForItem(itemId: string, date?: string): Promise<Reservation | null>
  getCurrentReservationsForItems(itemIds: string[], date?: string): Promise<Reservation[]>
  getUpcomingReservationsForItem(itemId: string, limit?: number): Promise<Reservation[]>
  listBookingRequests(): Promise<BookingRequestRecord[]>
  createBookingRequest(input: BookingRequestInput): Promise<BookingRequestRecord>
  getBookingRequestById(requestId: string): Promise<BookingRequestRecord | null>
  updateBookingRequestStatus(
    requestId: string,
    status: BookingRequestStatus,
  ): Promise<BookingRequestRecord>
  markBookingRequestConverted(
    requestId: string,
    reservationId: string,
  ): Promise<BookingRequestRecord>
  listPairingCandidates(requestId: string): Promise<BookingCustomerPairingCandidateRecord[]>
  replacePairingCandidates(
    requestId: string,
    candidates: BookingCustomerPairingCandidateRecord[],
  ): Promise<BookingCustomerPairingCandidateRecord[]>
  updateBookingRequestPairingStatus(
    requestId: string,
    pairingStatus: BookingCustomerPairingStatus,
  ): Promise<BookingRequestRecord>
  resolveBookingRequestPairing(
    decision: BookingCustomerPairingDecision,
  ): Promise<BookingRequestRecord>
  listBookingStatusEvents(filters?: {
    reservationId?: string
    requestId?: string
  }): Promise<BookingStatusEventRecord[]>
  appendBookingStatusEvent(input: BookingStatusEventInput): Promise<BookingStatusEventRecord>
  listBookingChangeRequests(filters?: {
    reservationId?: string
    status?: BookingChangeRequestRecord['status']
  }): Promise<BookingChangeRequestRecord[]>
  createBookingChangeRequest(input: BookingChangeRequestInput): Promise<BookingChangeRequestRecord>
  getBookingChangeRequestById(changeRequestId: string): Promise<BookingChangeRequestRecord | null>
  updateBookingChangeRequestStatus(
    changeRequestId: string,
    status: BookingChangeRequestRecord['status'],
    decidedBy?: string | null,
  ): Promise<BookingChangeRequestRecord>
  listBookingConflicts(filters?: {
    reservationId?: string
    requestId?: string
    status?: BookingConflictRecord['status']
  }): Promise<BookingConflictRecord[]>
  createBookingConflict(input: BookingConflictInput): Promise<BookingConflictRecord>
  resolveBookingConflict(conflictId: string): Promise<BookingConflictRecord>
  listAvailabilityLocks(filters?: {
    itemId?: string
    status?: AvailabilityLockRecord['status']
  }): Promise<AvailabilityLockRecord[]>
  createAvailabilityLock(input: AvailabilityLockInput): Promise<AvailabilityLockRecord>
  releaseAvailabilityLock(lockId: string): Promise<AvailabilityLockRecord>
  createPricingSnapshot(input: PricingSnapshotInput): Promise<PricingSnapshotRecord>
  getPricingSnapshotById(snapshotId: string): Promise<PricingSnapshotRecord | null>
  getPricingSnapshotForReservation(reservationId: string): Promise<PricingSnapshotRecord | null>
  listPricingSnapshotsForReservation(reservationId: string): Promise<PricingSnapshotRecord[]>
  updatePricingSnapshotStatus(
    snapshotId: string,
    status: NonNullable<PricingSnapshotRecord['status']>,
    metadata?: Record<string, unknown> | null,
  ): Promise<PricingSnapshotRecord>
  linkPricingSnapshotToReservation(reservationId: string, snapshotId: string): Promise<PricingSnapshotRecord>
  linkPricingSnapshotToAccount(accountId: string, snapshotId: string): Promise<PricingSnapshotRecord>
  linkBookingFolio(input: BookingFolioLinkInput): Promise<BookingFolioLinkRecord>
  linkBookingRegistryEvent(
    input: BookingRegistryEventLinkInput,
  ): Promise<BookingRegistryEventLinkRecord>
  appendRegistryEvent(input: RegistryEventInput): Promise<RegistryEvent>
  listRegistryEvents(filter?: RegistryEventFilter): Promise<RegistryEvent[]>
  getRegistryEventById(id: string): Promise<RegistryEvent | null>
  acknowledgeRegistryEvent(id: string): Promise<RegistryEvent>
  resolveRegistryEvent(id: string): Promise<RegistryEvent>
  voidRegistryEvent(id: string, reason?: string | null): Promise<RegistryEvent>
  findRegistryEventByDedupeKey(dedupeKey: string): Promise<RegistryEvent | null>
  seedInitialTariffsIfMissing(): Promise<void>
  getActiveTariffRules(): Promise<TariffRule[]>
  getTariffRule(tariffRuleId: string): Promise<TariffRule | null>
  createTariffRule(input: TariffRuleInput): Promise<TariffRule>
  updateTariffRule(tariffRuleId: string, input: TariffRuleInput): Promise<TariffRule>
  deactivateTariffRule(tariffRuleId: string): Promise<void>
  suggestPriceForItem(
    item: BeachItem,
    reservationType: TariffReservationType,
    date?: string,
  ): Promise<PriceSuggestion>
  seedInitialExtraItemsIfMissing(): Promise<void>
  getActiveExtraItemCatalog(): Promise<ExtraItemCatalogEntry[]>
  createExtraItemCatalogEntry(input: ExtraItemCatalogInput): Promise<ExtraItemCatalogEntry>
  updateExtraItemCatalogEntry(
    id: string,
    input: ExtraItemCatalogInput,
  ): Promise<ExtraItemCatalogEntry>
  deactivateExtraItemCatalogEntry(id: string): Promise<void>
  addExtraItemToAccount(accountId: string, input: AccountExtraItemInput): Promise<AccountExtraItem>
  updateAccountExtraItem(id: string, input: AccountExtraItemInput): Promise<AccountExtraItem>
  removeAccountExtraItem(id: string): Promise<void>
  getExtraItemsForAccount(accountId: string): Promise<AccountExtraItem[]>
  seedInitialIncludedItemsIfMissing(): Promise<void>
  getIncludedItemsForTariffContext(
    itemType: string,
    rowLabel: string | null,
    reservationType: string,
  ): Promise<TariffIncludedItem[]>
  recalculateAccountTotalWithExtras(accountId: string): Promise<Account>
  createOrUpdatePaymentSchedule(input: PaymentScheduleInput): Promise<PaymentSchedule>
  resetSeedForDevelopmentOnly(): Promise<void>
  resetBrowserDatabaseForDevelopmentOnly(): Promise<void>
}

export type BeachState = {
  layout: BeachLayout
  items: BeachItem[]
  runtime: DatabaseRuntime
}
