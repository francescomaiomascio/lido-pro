import { Capacitor } from '@capacitor/core'
import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite'
import type {
  BeachItem,
  BeachItemStatus,
  BeachItemStatusEvent,
  BeachItemUsageType,
  BeachLayout,
  BeachStatusSummary,
} from '../types/beach'
import type {
  BeachItemAssignedCustomer,
  BeachItemCustomerAssignment,
  Customer,
  CustomerAssignmentType,
  CustomerInput,
} from '../types/customer'
import type {
  Account,
  AccountInput,
  AccountStatus,
  AccountType,
  Payment,
  PaymentSchedule,
  PaymentScheduleInput,
  PaymentScheduleType,
  PaymentMethod,
} from '../types/account'
import type { Reservation, ReservationInput, ReservationStatus, ReservationType } from '../types/reservation'
import type {
  PriceSuggestion,
  TariffItemType,
  TariffReservationType,
  TariffRule,
  TariffRuleInput,
} from '../types/tariff'
import type {
  AccountExtraItem,
  AccountExtraItemInput,
  ExtraItemCatalogEntry,
  ExtraItemCatalogInput,
  TariffIncludedItem,
} from '../types/extraItem'
import type { BeachDatabaseAdapter } from '../types/db'
import type {
  DatabaseDiagnostics,
  DatabaseTableCategory,
  DatabaseTableReadOptions,
  DatabaseTableRows,
  DatabaseTableSummary,
} from '../types/db'
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
import { assetMetricDefinitions } from '../map-canvas/assets/assetMetricDefinitions'
import { createDefaultBeachMetricModel } from '../map-canvas/metric/beachMetricModel'
import { calculateParametricLayout, type ParametricLayoutOutput } from '../map-canvas/parametric/parametricLayoutEngine'
import type {
  BeachLayoutDistanceRulesDefinition,
  BeachLayoutElement,
  BeachLayoutRowDefinition,
  BeachLayoutVersion,
  BeachLayoutZoneDefinition,
  ParametricLayoutBundle,
} from '../map-canvas/parametric/parametricLayoutTypes'
import type { ParametricSetupAssetMetric, ParametricSetupState } from '../map-canvas/parametric/parametricSetupState'
import { getTodayIsoDate } from '../format/dateRange'
import { doDateRangesOverlap, isDateRangeValid } from '../reservations/periodRules'
import { migrations } from './migrations'
import { DATABASE_NAME, SCHEMA_VERSION } from './schema'
import { createInitialBeachSeed, defaultBeachLayout, initialLayoutVersion, INITIAL_SEED_VERSION } from './seed'

type BeachItemRow = {
  id: string
  layout_id: string
  code: string
  type: BeachItem['type']
  row_label: string
  row_index: number
  number_index: number
  x_m: number
  y_m: number
  width_m: number
  height_m: number
  rotation_deg: number
  status: BeachItemStatus
  usage_type?: BeachItemUsageType | null
  operational_note?: string | null
  status_updated_at?: string | null
  active: number
}

type BeachItemStatusEventRow = {
  id: string
  item_id: string
  previous_status: BeachItemStatus | null
  next_status: BeachItemStatus
  note: string | null
  created_at: string
}

type BeachLayoutRow = {
  id: string
  name: string
  width_m: number
  depth_m: number
  is_active: number
}


type ParametricLayoutVersionRow = {
  id: string
  name: string
  status: BeachLayoutVersion['status']
  source: BeachLayoutVersion['source']
  beach_width_m: number
  beach_depth_m: number
  sea_side: BeachLayoutVersion['seaSide']
  created_at: string
  updated_at: string
  activated_at: string | null
}

type ParametricLayoutElementRow = {
  id: string
  layout_version_id: string
  legacy_beach_item_id: string | null
  code: string
  family: BeachLayoutElement['family']
  row_label: string | null
  number_index: number | null
  x_m: number
  y_m: number
  width_m: number
  height_m: number
  diameter_m: number | null
  rotation_deg: number
  zone_id: string | null
  locked: number
  active: number
  z_index: number
}

type ParametricLayoutRowRow = {
  id: string
  layout_version_id: string
  row_label: string
  family: BeachLayoutRowDefinition['family']
  item_count: number
  y_m: number | null
  min_gap_m: number | null
  distribution_mode: BeachLayoutRowDefinition['distributionMode']
  locked: number
}

type ParametricLayoutZoneRow = {
  id: string
  layout_version_id: string
  type: string
  label: string
  x_m: number
  y_m: number
  width_m: number
  height_m: number
  locked: number
  visible: number
}


type ParametricAssetMetricRow = {
  id: string
  layout_version_id: string
  asset_family: ParametricSetupAssetMetric['family']
  asset_variant_id: string | null
  label: string
  width_m: number
  height_m: number
  diameter_m: number | null
  collision_shape: ParametricSetupAssetMetric['collisionShape']
  spacing_class: ParametricSetupAssetMetric['spacingClass']
  locked: number
}

type ParametricLayoutDistanceRulesRow = {
  id: string
  layout_version_id: string
  min_palm_gap_m: number
  min_umbrella_gap_m: number
  min_small_palm_gap_m: number
  min_mixed_asset_gap_m: number
  min_palm_row_gap_m: number
  min_umbrella_row_gap_m: number
  min_zone_gap_m: number
  margin_from_boundary_m: number
  margin_from_sea_m: number
  margin_from_entrance_m: number
}

type JeepSqliteElement = HTMLElement & {
  componentOnReady?: () => Promise<unknown>
  isStoreOpen?: () => Promise<boolean>
}

type CustomerRow = {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  notes: string | null
  active: number
  created_at: string
  updated_at: string
}

type CustomerAssignmentRow = {
  id: string
  item_id: string
  customer_id: string
  assignment_type: CustomerAssignmentType
  active: number
  assigned_at: string
  unassigned_at: string | null
  note: string | null
  created_at: string
  updated_at: string
}

type AccountRow = {
  id: string
  item_id: string
  customer_id: string
  assignment_id: string | null
  account_type: AccountType
  season_label: string | null
  base_amount_cents?: number | null
  extras_amount_cents?: number | null
  total_amount_cents: number
  paid_amount_cents: number
  balance_amount_cents: number
  status: AccountStatus
  notes: string | null
  active: number
  opened_at: string
  closed_at: string | null
  created_at: string
  updated_at: string
}

type ExtraItemCatalogRow = {
  id: string
  name: string
  category?: string | null
  unit_label: string
  default_amount_cents: number
  max_quantity_per_booking?: number | null
  included_quantity_default?: number | null
  active: number
  sort_order: number
  notes: string | null
  created_at: string
  updated_at: string
}

type AccountExtraItemRow = {
  id: string
  account_id: string
  catalog_item_id: string | null
  name: string
  quantity: number
  unit_amount_cents: number
  total_amount_cents: number
  notes: string | null
  active: number
  created_at: string
  updated_at: string
}

type TariffIncludedItemRow = {
  id: string
  tariff_rule_id: string | null
  item_type: string
  row_label: string | null
  reservation_type: string
  catalog_item_id: string | null
  name: string
  quantity: number
  included: number
  active: number
  created_at: string
  updated_at: string
}

type PaymentScheduleRow = {
  id: string
  account_id: string
  schedule_type: PaymentScheduleType
  total_installments: number
  active: number
  notes: string | null
  created_at: string
  updated_at: string
}

type PaymentRow = {
  id: string
  account_id: string
  amount_cents: number
  payment_method: PaymentMethod
  paid_at: string
  note: string | null
  created_at: string
}

type ReservationRow = {
  id: string
  item_id: string
  customer_id: string
  assignment_id: string | null
  account_id: string | null
  reservation_type: ReservationType
  start_date: string
  end_date: string
  status: ReservationStatus
  title: string | null
  notes: string | null
  active: number
  created_at: string
  updated_at: string
  cancelled_at: string | null
}

type BookingRequestRow = {
  id: string
  workspace_id: string | null
  source: BookingRequestRecord['source']
  status: BookingRequestRecord['status']
  pairing_status: BookingRequestRecord['pairingStatus']
  matched_customer_id: string | null
  pairing_decision_json: string | null
  pairing_resolved_at: string | null
  customer_payload_json: string
  requested_period_json: string
  requested_item_id: string | null
  requested_item_type: string | null
  requested_extras_json: string | null
  converted_reservation_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  sync_state: BookingRequestRecord['syncState']
  remote_id: string | null
  version: number
}

type BookingCustomerPairingCandidateRow = {
  id: string
  request_id: string
  existing_customer_id: string
  score: number
  confidence: BookingCustomerPairingCandidateRecord['confidence']
  reasons_json: string
  matched_fields_json: string
  created_at: string
}

type BookingStatusEventRow = {
  id: string
  reservation_id: string | null
  request_id: string | null
  from_status: string | null
  to_status: string
  source: BookingStatusEventRecord['source']
  reason: string | null
  payload_json: string | null
  created_at: string
  created_by: string | null
  device_id: string | null
}

type BookingConflictRow = {
  id: string
  reservation_id: string | null
  request_id: string | null
  conflict_type: BookingConflictRecord['conflictType']
  severity: BookingConflictRecord['severity']
  affected_item_ids_json: string
  affected_period_json: string
  message: string
  status: BookingConflictRecord['status']
  created_at: string
  resolved_at: string | null
}

type AvailabilityLockRow = {
  id: string
  workspace_id: string | null
  item_id: string
  period_json: string
  source: AvailabilityLockRecord['source']
  reservation_id: string | null
  request_id: string | null
  status: AvailabilityLockRecord['status']
  expires_at: string | null
  created_at: string
  updated_at: string
}

type PricingSnapshotRow = {
  id: string
  reservation_id: string | null
  source_rule_id: string | null
  catalog_item_id: string | null
  period_type: PricingSnapshotRecord['periodType']
  scope_json: string | null
  base_price: number
  extras_total: number
  included_items_json: string | null
  calculated_total: number
  manual_override_json: string | null
  created_at: string
  updated_at: string
}

type BookingFolioLinkRow = {
  id: string
  reservation_id: string
  account_id: string
  status: BookingFolioLinkRecord['status']
  created_at: string
  updated_at: string
}

type BookingRegistryEventLinkRow = {
  id: string
  reservation_id: string | null
  request_id: string | null
  registry_event_id: string
  event_type: string
  created_at: string
}

type TariffRuleRow = {
  id: string
  name: string
  item_type: TariffItemType
  row_label: string | null
  reservation_type: TariffReservationType
  amount_cents: number
  currency: 'EUR'
  season_year: number | null
  valid_from: string | null
  valid_to: string | null
  priority: number
  active: number
  notes: string | null
  created_at: string
  updated_at: string
}

const nowIso = () => new Date().toISOString()
const SQLITE_STORE_NAME = DATABASE_NAME.endsWith('.db') ? DATABASE_NAME.slice(0, -3) : DATABASE_NAME
type PersistentSQLiteRuntime = 'native-sqlite' | 'web-persistent-sqlite'

const DATABASE_TABLES: { name: string; category: DatabaseTableCategory }[] = [
  { name: 'app_meta', category: 'system' },
  { name: 'beach_layouts', category: 'layout' },
  { name: 'layout_versions', category: 'layout' },
  { name: 'beach_items', category: 'layout' },
  { name: 'beach_item_status_events', category: 'layout' },
  { name: 'beach_layout_versions', category: 'layout' },
  { name: 'beach_layout_elements', category: 'layout' },
  { name: 'beach_layout_rows', category: 'layout' },
  { name: 'beach_layout_zones', category: 'layout' },
  { name: 'beach_layout_distance_rules', category: 'layout' },
  { name: 'beach_layout_asset_metrics', category: 'layout' },
  { name: 'customers', category: 'clienti' },
  { name: 'beach_item_customer_assignments', category: 'clienti' },
  { name: 'accounts', category: 'conti' },
  { name: 'payments', category: 'pagamenti' },
  { name: 'payment_schedules', category: 'pagamenti' },
  { name: 'payment_installments', category: 'pagamenti' },
  { name: 'reservations', category: 'booking' },
  { name: 'booking_requests', category: 'booking' },
  { name: 'booking_customer_pairing_candidates', category: 'booking' },
  { name: 'booking_status_events', category: 'booking' },
  { name: 'booking_conflicts', category: 'booking' },
  { name: 'availability_locks', category: 'booking' },
  { name: 'pricing_snapshots', category: 'booking' },
  { name: 'booking_folio_links', category: 'booking' },
  { name: 'booking_registry_event_links', category: 'registro' },
  { name: 'tariff_rules', category: 'articoli' },
  { name: 'tariff_included_items', category: 'articoli' },
  { name: 'extra_item_catalog', category: 'articoli' },
  { name: 'account_extra_items', category: 'articoli' },
]

const DATABASE_TABLE_BY_NAME = new Map(DATABASE_TABLES.map((table) => [table.name, table]))

const requireKnownDatabaseTable = (tableName: string) => {
  const table = DATABASE_TABLE_BY_NAME.get(tableName)
  if (!table) {
    throw new Error('Tabella diagnostica non consentita.')
  }
  return table
}

const normalizeTableLimit = (limit?: number) => {
  const normalized = Number(limit)
  if (normalized === 250 || normalized === 500) return normalized
  return 100
}

const normalizeTableOffset = (offset?: number) => Math.max(0, Math.trunc(offset ?? 0))

const toDiagnosticRows = <T extends object>(rows: T[]): Record<string, unknown>[] =>
  rows.map((row) => ({ ...row }) as Record<string, unknown>)

const toLayout = (row: BeachLayoutRow): BeachLayout => ({
  id: row.id,
  name: row.name,
  widthM: row.width_m,
  depthM: row.depth_m,
  isActive: row.is_active === 1,
})

const toItem = (row: BeachItemRow): BeachItem => ({
  id: row.id,
  layoutId: row.layout_id,
  code: row.code,
  type: row.type,
  rowLabel: row.row_label,
  rowIndex: row.row_index,
  numberIndex: row.number_index,
  xM: row.x_m,
  yM: row.y_m,
  widthM: row.width_m,
  heightM: row.height_m,
  rotationDeg: row.rotation_deg,
  status: row.status,
  usageType: row.usage_type ?? 'daily',
  operationalNote: row.operational_note ?? '',
  statusUpdatedAt: row.status_updated_at ?? null,
  active: row.active === 1,
})


const toParametricVersion = (row: ParametricLayoutVersionRow): BeachLayoutVersion => ({
  id: row.id,
  name: row.name,
  status: row.status,
  source: row.source,
  beachWidthM: row.beach_width_m,
  beachDepthM: row.beach_depth_m,
  seaSide: row.sea_side,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  activatedAt: row.activated_at,
})

const toParametricElement = (row: ParametricLayoutElementRow): BeachLayoutElement => ({
  id: row.id,
  layoutVersionId: row.layout_version_id,
  legacyBeachItemId: row.legacy_beach_item_id,
  code: row.code,
  family: row.family,
  rowLabel: row.row_label,
  numberIndex: row.number_index,
  xM: row.x_m,
  yM: row.y_m,
  widthM: row.width_m,
  heightM: row.height_m,
  diameterM: row.diameter_m,
  rotationDeg: row.rotation_deg,
  zoneId: row.zone_id,
  locked: row.locked === 1,
  active: row.active === 1,
  zIndex: row.z_index,
})

const toParametricRow = (row: ParametricLayoutRowRow): BeachLayoutRowDefinition => ({
  id: row.id,
  layoutVersionId: row.layout_version_id,
  rowLabel: row.row_label,
  family: row.family,
  itemCount: row.item_count,
  yM: row.y_m,
  minGapM: row.min_gap_m,
  distributionMode: row.distribution_mode,
  locked: row.locked === 1,
})

const toParametricZone = (row: ParametricLayoutZoneRow): BeachLayoutZoneDefinition => ({
  id: row.id,
  layoutVersionId: row.layout_version_id,
  type: row.type,
  label: row.label,
  xM: row.x_m,
  yM: row.y_m,
  widthM: row.width_m,
  heightM: row.height_m,
  locked: row.locked === 1,
  visible: row.visible === 1,
})


const toSetupAssetMetric = (row: ParametricAssetMetricRow): ParametricSetupAssetMetric => ({
  assetId: row.asset_variant_id ?? row.id,
  family: row.asset_family,
  label: row.label,
  defaultWidthM: row.width_m,
  defaultHeightM: row.height_m,
  defaultDiameterM: row.diameter_m ?? undefined,
  collisionShape: row.collision_shape,
  spacingClass: row.spacing_class,
  locked: row.locked === 1,
})

const toParametricDistanceRules = (
  row: ParametricLayoutDistanceRulesRow,
): BeachLayoutDistanceRulesDefinition => ({
  id: row.id,
  layoutVersionId: row.layout_version_id,
  minPalmGapM: row.min_palm_gap_m,
  minUmbrellaGapM: row.min_umbrella_gap_m,
  minSmallPalmGapM: row.min_small_palm_gap_m,
  minMixedAssetGapM: row.min_mixed_asset_gap_m,
  minPalmRowGapM: row.min_palm_row_gap_m,
  minUmbrellaRowGapM: row.min_umbrella_row_gap_m,
  minZoneGapM: row.min_zone_gap_m,
  marginFromBoundaryM: row.margin_from_boundary_m,
  marginFromSeaM: row.margin_from_sea_m,
  marginFromEntranceM: row.margin_from_entrance_m,
})

const toStatusEvent = (row: BeachItemStatusEventRow): BeachItemStatusEvent => ({
  id: row.id,
  itemId: row.item_id,
  previousStatus: row.previous_status,
  nextStatus: row.next_status,
  note: row.note ?? '',
  createdAt: row.created_at,
})

const toCustomer = (row: CustomerRow): Customer => ({
  id: row.id,
  fullName: row.full_name,
  phone: row.phone,
  email: row.email,
  notes: row.notes,
  active: row.active === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toAssignment = (row: CustomerAssignmentRow): BeachItemCustomerAssignment => ({
  id: row.id,
  itemId: row.item_id,
  customerId: row.customer_id,
  assignmentType: row.assignment_type,
  active: row.active === 1,
  assignedAt: row.assigned_at,
  unassignedAt: row.unassigned_at,
  note: row.note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toAccount = (row: AccountRow): Account => ({
  id: row.id,
  itemId: row.item_id,
  customerId: row.customer_id,
  assignmentId: row.assignment_id,
  accountType: row.account_type,
  seasonLabel: row.season_label,
  baseAmountCents: row.base_amount_cents ?? row.total_amount_cents,
  extrasAmountCents: row.extras_amount_cents ?? 0,
  totalAmountCents: row.total_amount_cents,
  paidAmountCents: row.paid_amount_cents,
  balanceAmountCents: row.balance_amount_cents,
  status: row.status,
  notes: row.notes,
  active: row.active === 1,
  openedAt: row.opened_at,
  closedAt: row.closed_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toExtraCatalogEntry = (row: ExtraItemCatalogRow): ExtraItemCatalogEntry => ({
  id: row.id,
  name: row.name,
  category: row.category ?? null,
  unitLabel: row.unit_label,
  defaultAmountCents: row.default_amount_cents,
  maxQuantityPerBooking: row.max_quantity_per_booking ?? 99,
  includedQuantityDefault: row.included_quantity_default ?? 0,
  active: row.active === 1,
  sortOrder: row.sort_order,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toAccountExtraItem = (row: AccountExtraItemRow): AccountExtraItem => ({
  id: row.id,
  accountId: row.account_id,
  catalogItemId: row.catalog_item_id,
  name: row.name,
  quantity: row.quantity,
  unitAmountCents: row.unit_amount_cents,
  totalAmountCents: row.total_amount_cents,
  notes: row.notes,
  active: row.active === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toTariffIncludedItem = (row: TariffIncludedItemRow): TariffIncludedItem => ({
  id: row.id,
  tariffRuleId: row.tariff_rule_id,
  itemType: row.item_type,
  rowLabel: row.row_label,
  reservationType: row.reservation_type,
  catalogItemId: row.catalog_item_id,
  name: row.name,
  quantity: row.quantity,
  included: row.included === 1,
  active: row.active === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toPaymentSchedule = (row: PaymentScheduleRow): PaymentSchedule => ({
  id: row.id,
  accountId: row.account_id,
  scheduleType: row.schedule_type,
  totalInstallments: row.total_installments,
  active: row.active === 1,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toPayment = (row: PaymentRow): Payment => ({
  id: row.id,
  accountId: row.account_id,
  amountCents: row.amount_cents,
  paymentMethod: row.payment_method,
  paidAt: row.paid_at,
  note: row.note,
  createdAt: row.created_at,
})

const toReservation = (row: ReservationRow): Reservation => ({
  id: row.id,
  itemId: row.item_id,
  customerId: row.customer_id,
  assignmentId: row.assignment_id,
  accountId: row.account_id,
  reservationType: row.reservation_type,
  startDate: row.start_date,
  endDate: row.end_date,
  status: row.status,
  title: row.title,
  notes: row.notes,
  active: row.active === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  cancelledAt: row.cancelled_at,
})

const parseJsonField = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) {
    return fallback
  }
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

const serializeJsonField = (value: unknown): string => JSON.stringify(value ?? null)

const toBookingRequest = (row: BookingRequestRow): BookingRequestRecord => ({
  id: row.id,
  workspaceId: row.workspace_id,
  source: row.source,
  status: row.status,
  pairingStatus: row.pairing_status,
  matchedCustomerId: row.matched_customer_id,
  pairingDecision: parseJsonField(row.pairing_decision_json, null),
  pairingResolvedAt: row.pairing_resolved_at,
  customerPayload: parseJsonField(row.customer_payload_json, {}),
  requestedPeriod: parseJsonField(row.requested_period_json, {
    id: '',
    type: 'daily',
    startDate: '',
    label: '',
  }),
  requestedItemId: row.requested_item_id,
  requestedItemType: row.requested_item_type,
  requestedExtras: parseJsonField(row.requested_extras_json, []),
  convertedReservationId: row.converted_reservation_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  deletedAt: row.deleted_at,
  syncState: row.sync_state,
  remoteId: row.remote_id,
  version: row.version,
})

const toBookingCustomerPairingCandidate = (
  row: BookingCustomerPairingCandidateRow,
): BookingCustomerPairingCandidateRecord => ({
  id: row.id,
  requestId: row.request_id,
  existingCustomerId: row.existing_customer_id,
  score: row.score,
  confidence: row.confidence,
  reasons: parseJsonField(row.reasons_json, []),
  matchedFields: parseJsonField(row.matched_fields_json, []),
  createdAt: row.created_at,
})

const toBookingStatusEvent = (row: BookingStatusEventRow): BookingStatusEventRecord => ({
  id: row.id,
  reservationId: row.reservation_id,
  requestId: row.request_id,
  fromStatus: row.from_status,
  toStatus: row.to_status,
  source: row.source,
  reason: row.reason,
  payload: parseJsonField(row.payload_json, null),
  createdAt: row.created_at,
  createdBy: row.created_by,
  deviceId: row.device_id,
})

const toBookingConflict = (row: BookingConflictRow): BookingConflictRecord => ({
  id: row.id,
  reservationId: row.reservation_id,
  requestId: row.request_id,
  conflictType: row.conflict_type,
  severity: row.severity,
  affectedItemIds: parseJsonField(row.affected_item_ids_json, []),
  affectedPeriod: parseJsonField(row.affected_period_json, {
    id: '',
    type: 'daily',
    startDate: '',
    label: '',
  }),
  message: row.message,
  status: row.status,
  createdAt: row.created_at,
  resolvedAt: row.resolved_at,
})

const toAvailabilityLock = (row: AvailabilityLockRow): AvailabilityLockRecord => ({
  id: row.id,
  workspaceId: row.workspace_id,
  itemId: row.item_id,
  period: parseJsonField(row.period_json, {
    id: '',
    type: 'daily',
    startDate: '',
    label: '',
  }),
  source: row.source,
  reservationId: row.reservation_id,
  requestId: row.request_id,
  status: row.status,
  expiresAt: row.expires_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toPricingSnapshot = (row: PricingSnapshotRow): PricingSnapshotRecord => ({
  id: row.id,
  reservationId: row.reservation_id,
  sourceRuleId: row.source_rule_id,
  catalogItemId: row.catalog_item_id,
  periodType: row.period_type,
  scope: parseJsonField(row.scope_json, null),
  basePrice: row.base_price,
  extrasTotal: row.extras_total,
  includedItems: parseJsonField(row.included_items_json, []),
  calculatedTotal: row.calculated_total,
  manualOverride: parseJsonField(row.manual_override_json, null),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toBookingFolioLink = (row: BookingFolioLinkRow): BookingFolioLinkRecord => ({
  id: row.id,
  reservationId: row.reservation_id,
  accountId: row.account_id,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toBookingRegistryEventLink = (
  row: BookingRegistryEventLinkRow,
): BookingRegistryEventLinkRecord => ({
  id: row.id,
  reservationId: row.reservation_id,
  requestId: row.request_id,
  registryEventId: row.registry_event_id,
  eventType: row.event_type,
  createdAt: row.created_at,
})

const toTariffRule = (row: TariffRuleRow): TariffRule => ({
  id: row.id,
  name: row.name,
  itemType: row.item_type,
  rowLabel: row.row_label,
  reservationType: row.reservation_type,
  amountCents: row.amount_cents,
  currency: row.currency,
  seasonYear: row.season_year,
  validFrom: row.valid_from,
  validTo: row.valid_to,
  priority: row.priority,
  active: row.active === 1,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const initialTariffRules: TariffRuleInput[] = [
  {
    name: 'Ombrellone giornaliero',
    itemType: 'umbrella',
    rowLabel: null,
    reservationType: 'daily',
    amountCents: 1200,
    priority: 40,
  },
  {
    name: 'Palma giornaliera',
    itemType: 'palm',
    rowLabel: null,
    reservationType: 'daily',
    amountCents: 1500,
    priority: 40,
  },
  {
    name: 'Palmetta giornaliera',
    itemType: 'small_palm',
    rowLabel: null,
    reservationType: 'daily',
    amountCents: 1000,
    priority: 40,
  },
  {
    name: 'Palma prima fila',
    itemType: 'palm',
    rowLabel: 'P1',
    reservationType: 'seasonal',
    amountCents: 150000,
    priority: 10,
  },
  {
    name: 'Palma seconda fila',
    itemType: 'palm',
    rowLabel: 'P2',
    reservationType: 'seasonal',
    amountCents: 100000,
    priority: 10,
  },
  {
    name: 'Palma terza fila',
    itemType: 'palm',
    rowLabel: 'P3',
    reservationType: 'seasonal',
    amountCents: 80000,
    priority: 10,
  },
  {
    name: 'Palma quarta fila',
    itemType: 'palm',
    rowLabel: 'P4',
    reservationType: 'seasonal',
    amountCents: 70000,
    priority: 10,
  },
  {
    name: 'Ombrellone stagionale',
    itemType: 'umbrella',
    rowLabel: null,
    reservationType: 'seasonal',
    amountCents: 60000,
    priority: 50,
  },
  {
    name: 'Palmetta stagionale',
    itemType: 'small_palm',
    rowLabel: 'PM',
    reservationType: 'seasonal',
    amountCents: 80000,
    priority: 10,
  },
]

const createEntityId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const createEventId = (itemId: string, createdAt: string) =>
  `${itemId}-${createdAt.replace(/[^0-9]/g, '')}-${Math.random().toString(36).slice(2, 8)}`

const createSummary = (items: BeachItem[]): BeachStatusSummary => ({
  total: items.length,
  daily: items.filter((item) => item.usageType === 'daily').length,
  seasonal: items.filter((item) => item.usageType === 'seasonal').length,
  free: items.filter((item) => item.status === 'free').length,
  occupied: items.filter((item) => item.status === 'occupied').length,
  reserved: items.filter((item) => item.status === 'reserved').length,
  maintenance: items.filter((item) => item.status === 'maintenance').length,
})

const calculateAccountStatus = (
  totalAmountCents: number,
  paidAmountCents: number,
  currentStatus?: AccountStatus,
): AccountStatus => {
  if (currentStatus === 'cancelled') {
    return 'cancelled'
  }

  if (paidAmountCents >= totalAmountCents && totalAmountCents > 0) {
    return 'paid'
  }

  if (paidAmountCents > 0 && paidAmountCents < totalAmountCents) {
    return 'partial'
  }

  return 'open'
}

const getPragmaTableColumnNames = (values: unknown[] | undefined): Set<string> => {
  return new Set(
    (values ?? [])
      .map((row) => {
        const record = row as Record<string, unknown>
        return record.name ?? record.Name ?? record['1']
      })
      .filter((name): name is string => typeof name === 'string' && name.length > 0),
  )
}

class NativeSQLiteAdapter implements BeachDatabaseAdapter {
  runtime: PersistentSQLiteRuntime
  private connection: SQLiteDBConnection | null = null
  private sqlite: SQLiteConnection | null = null
  private webStoreInitialized = false
  private pagehideFlushRegistered = false

  constructor(runtime: PersistentSQLiteRuntime = 'native-sqlite') {
    this.runtime = runtime
  }

  async initialize(): Promise<void> {
    const db = await this.getConnection()
    for (const migration of migrations) {
      if (migration.version <= SCHEMA_VERSION) {
        await db.execute(migration.sql)
      }
    }
    await this.ensureRuntimeColumns(db)
    await this.seedIfNeeded(db)
    await this.seedInitialTariffsIfMissing()
    await this.seedInitialExtraItemsIfMissing()
    await this.seedInitialIncludedItemsIfMissing()
    await this.persistWebStore()
  }

  async getDatabaseDiagnostics(): Promise<DatabaseDiagnostics> {
    const tables = await this.listDatabaseTables()
    return {
      runtime: this.runtime,
      databaseName: DATABASE_NAME,
      schemaVersion: SCHEMA_VERSION,
      tables,
      totalVisibleRows: tables.reduce((sum, table) => sum + table.rowCount, 0),
      refreshedAt: nowIso(),
    }
  }

  async listDatabaseTables(): Promise<DatabaseTableSummary[]> {
    const db = await this.getConnection()
    const result = await db.query("SELECT name FROM sqlite_master WHERE type = 'table'")
    const existingNames = new Set((result.values ?? []).map((row) => String((row as Record<string, unknown>).name)))
    const tables = await Promise.all(
      DATABASE_TABLES
        .filter((table) => existingNames.has(table.name))
        .map(async (table) => ({
          ...table,
          rowCount: await this.getTableRowCount(table.name),
        })),
    )
    return tables
  }

  async getTableRowCount(tableName: string): Promise<number> {
    requireKnownDatabaseTable(tableName)
    const db = await this.getConnection()
    const result = await db.query(`SELECT COUNT(*) AS count FROM "${tableName}"`)
    return Number(result.values?.[0]?.count ?? 0)
  }

  async readTableRows(
    tableName: string,
    options: DatabaseTableReadOptions = {},
  ): Promise<DatabaseTableRows> {
    const table = requireKnownDatabaseTable(tableName)
    const db = await this.getConnection()
    const limit = normalizeTableLimit(options.limit)
    const offset = normalizeTableOffset(options.offset)
    const [rowCount, rowsResult] = await Promise.all([
      this.getTableRowCount(tableName),
      db.query(`SELECT * FROM "${tableName}" LIMIT ? OFFSET ?`, [limit, offset]),
    ])

    return {
      tableName,
      category: table.category,
      rowCount,
      limit,
      offset,
      rows: (rowsResult.values ?? []) as Record<string, unknown>[],
      refreshedAt: nowIso(),
    }
  }

  async getActiveLayout(): Promise<BeachLayout> {
    const db = await this.getConnection()
    const result = await db.query(
      'SELECT id, name, width_m, depth_m, is_active FROM beach_layouts WHERE is_active = 1 LIMIT 1',
    )
    const row = result.values?.[0] as BeachLayoutRow | undefined

    if (!row) {
      throw new Error('No active beach layout found.')
    }

    return toLayout(row)
  }

  async getBeachItems(layoutId: string): Promise<BeachItem[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, layout_id, code, type, row_label, row_index, number_index, x_m, y_m,
        width_m, height_m, rotation_deg, status, usage_type, operational_note, status_updated_at, active
       FROM beach_items
       WHERE layout_id = ? AND active = 1
       ORDER BY type, row_index, number_index`,
      [layoutId],
    )

    const items = (result.values ?? []).map((row) => toItem(row as BeachItemRow))
    const assignedCustomers = await this.getAssignedCustomersForItems(items.map((item) => item.id))
    const assignedByItemId = new Map(assignedCustomers.map((assigned) => [assigned.itemId, assigned]))
    const activeAccounts = await this.getActiveAccountsForItems(items.map((item) => item.id))
    const accountByItemId = new Map(activeAccounts.map((account) => [account.itemId, account]))
    const currentReservations = await this.getCurrentReservationsForItems(items.map((item) => item.id))
    const reservationByItemId = new Map(
      currentReservations.map((reservation) => [reservation.itemId, reservation]),
    )

    return items.map((item) => ({
      ...item,
      assignedCustomer: assignedByItemId.get(item.id) ?? null,
      activeAccount: accountByItemId.get(item.id) ?? null,
      currentReservation: reservationByItemId.get(item.id) ?? null,
    }))
  }

  async updateBeachItemStatus(itemId: string, status: BeachItemStatus): Promise<void> {
    const db = await this.getConnection()
    const currentResult = await db.query('SELECT status FROM beach_items WHERE id = ?', [itemId])
    const previousStatus = currentResult.values?.[0]?.status as BeachItemStatus | undefined

    if (!previousStatus || previousStatus === status) {
      return
    }

    const now = nowIso()
    await db.run('UPDATE beach_items SET status = ?, status_updated_at = ?, updated_at = ? WHERE id = ?', [
      status,
      now,
      now,
      itemId,
    ])
    await db.run(
      `INSERT INTO beach_item_status_events
       (id, item_id, previous_status, next_status, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [createEventId(itemId, now), itemId, previousStatus, status, '', now],
    )
  }

  async updateBeachItemUsageType(itemId: string, usageType: BeachItemUsageType): Promise<void> {
    const db = await this.getConnection()
    await db.run('UPDATE beach_items SET usage_type = ?, updated_at = ? WHERE id = ?', [
      usageType,
      nowIso(),
      itemId,
    ])
  }

  async updateBeachItemOperationalNote(itemId: string, note: string): Promise<void> {
    const db = await this.getConnection()
    await db.run('UPDATE beach_items SET operational_note = ?, updated_at = ? WHERE id = ?', [
      note.trim(),
      nowIso(),
      itemId,
    ])
  }

  async getBeachItemStatusEvents(itemId: string): Promise<BeachItemStatusEvent[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, item_id, previous_status, next_status, note, created_at
       FROM beach_item_status_events
       WHERE item_id = ?
       ORDER BY created_at DESC
       LIMIT 3`,
      [itemId],
    )

    return (result.values ?? []).map((row) => toStatusEvent(row as BeachItemStatusEventRow))
  }

  async getBeachStatusSummary(layoutId: string): Promise<BeachStatusSummary> {
    return createSummary(await this.getBeachItems(layoutId))
  }

  async ensureParametricLayoutImported(): Promise<void> {
    const db = await this.getConnection()
    const active = await db.query('SELECT id FROM beach_layout_versions WHERE status = ? LIMIT 1', [
      'active',
    ])

    if (active.values?.[0]) {
      return
    }

    const layout = await this.getActiveLayout()
    const itemRows = await db.query(
      `SELECT id, layout_id, code, type, row_label, row_index, number_index, x_m, y_m,
        width_m, height_m, rotation_deg, status, usage_type, operational_note, status_updated_at, active
       FROM beach_items
       WHERE layout_id = ? AND active = 1
       ORDER BY row_index, number_index`,
      [layout.id],
    )
    const items = (itemRows.values ?? []).map((row) => toItem(row as BeachItemRow))
    const metricModel = createDefaultBeachMetricModel()
    const now = nowIso()
    const versionId = `layout-version-imported-${layout.id}`

    await db.run(
      `INSERT OR IGNORE INTO beach_layout_versions
       (id, name, status, source, beach_width_m, beach_depth_m, sea_side, created_at, updated_at, activated_at)
       VALUES (?, ?, 'active', 'imported_legacy', ?, ?, ?, ?, ?, ?)`,
      [
        versionId,
        `${layout.name} · layout parametrico`,
        layout.widthM,
        layout.depthM,
        metricModel.beach.seaSide,
        now,
        now,
        now,
      ],
    )

    for (const item of items) {
      const zoneId = item.type === 'umbrella' ? 'umbrellas' : item.type === 'small_palm' ? 'small-palms' : 'palms'
      await db.run(
        `INSERT OR IGNORE INTO beach_layout_elements
         (id, layout_version_id, legacy_beach_item_id, code, family, row_label, number_index, x_m, y_m,
          width_m, height_m, diameter_m, rotation_deg, zone_id, locked, active, z_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          `${versionId}-element-${item.id}`,
          versionId,
          item.id,
          item.code,
          item.type,
          item.rowLabel,
          item.numberIndex,
          item.xM,
          item.yM,
          item.widthM,
          item.heightM,
          item.widthM === item.heightM ? item.widthM : null,
          item.rotationDeg,
          zoneId,
          item.active ? 1 : 0,
          item.rowIndex * 100 + item.numberIndex,
        ],
      )
    }

    const rowsByLabel = new Map<string, BeachItem[]>()
    for (const item of items) {
      const rowItems = rowsByLabel.get(item.rowLabel) ?? []
      rowItems.push(item)
      rowsByLabel.set(item.rowLabel, rowItems)
    }

    for (const [rowLabel, rowItems] of rowsByLabel) {
      const first = rowItems[0]
      const averageY = rowItems.reduce((sum, item) => sum + item.yM, 0) / rowItems.length
      await db.run(
        `INSERT OR IGNORE INTO beach_layout_rows
         (id, layout_version_id, row_label, family, item_count, y_m, min_gap_m, distribution_mode, locked)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'imported_locked', 1)`,
        [
          `${versionId}-row-${rowLabel}`,
          versionId,
          rowLabel,
          first.type,
          rowItems.length,
          averageY,
          null,
        ],
      )
    }

    for (const zone of metricModel.zones) {
      await db.run(
        `INSERT OR IGNORE INTO beach_layout_zones
         (id, layout_version_id, type, label, x_m, y_m, width_m, height_m, locked, visible)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${versionId}-zone-${zone.id}`,
          versionId,
          zone.type,
          zone.label,
          zone.xM,
          zone.yM,
          zone.widthM,
          zone.heightM,
          zone.locked ? 1 : 0,
          zone.visible ? 1 : 0,
        ],
      )
    }

    const distances = metricModel.distances
    await db.run(
      `INSERT OR IGNORE INTO beach_layout_distance_rules
       (id, layout_version_id, min_palm_gap_m, min_umbrella_gap_m, min_small_palm_gap_m,
        min_mixed_asset_gap_m, min_palm_row_gap_m, min_umbrella_row_gap_m, min_zone_gap_m,
        margin_from_boundary_m, margin_from_sea_m, margin_from_entrance_m)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `${versionId}-distance-rules`,
        versionId,
        distances.minPalmGapM,
        distances.minUmbrellaGapM,
        distances.minSmallPalmGapM,
        distances.minMixedAssetGapM,
        distances.minPalmRowGapM,
        distances.minUmbrellaRowGapM,
        distances.minZoneGapM,
        distances.marginFromBoundaryM,
        distances.marginFromSeaM,
        distances.marginFromEntranceM,
      ],
    )

    for (const metric of assetMetricDefinitions) {
      await db.run(
        `INSERT OR IGNORE INTO beach_layout_asset_metrics
         (id, layout_version_id, asset_family, asset_variant_id, label, width_m, height_m,
          diameter_m, collision_shape, spacing_class, locked)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          `${versionId}-asset-metric-${metric.assetId}`,
          versionId,
          metric.family,
          metric.assetId,
          metric.label,
          metric.defaultWidthM,
          metric.defaultHeightM,
          metric.defaultDiameterM ?? null,
          metric.collisionShape,
          metric.spacingClass,
        ],
      )
    }
  }

  async getActiveParametricLayoutBundle(): Promise<ParametricLayoutBundle | null> {
    return this.getParametricLayoutBundleByStatus('active')
  }

  async getDraftParametricLayoutBundle(): Promise<ParametricLayoutBundle | null> {
    return this.getParametricLayoutBundleByStatus('draft')
  }

  async getParametricLayoutVersions(): Promise<BeachLayoutVersion[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, name, status, source, beach_width_m, beach_depth_m, sea_side,
        created_at, updated_at, activated_at
       FROM beach_layout_versions
       ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'draft' THEN 1 ELSE 2 END, updated_at DESC`,
    )
    return (result.values ?? []).map((row) => toParametricVersion(row as ParametricLayoutVersionRow))
  }

  async getParametricLayoutBundle(versionId: string): Promise<ParametricLayoutBundle | null> {
    const db = await this.getConnection()
    const versionResult = await db.query(
      `SELECT id, name, status, source, beach_width_m, beach_depth_m, sea_side,
        created_at, updated_at, activated_at
       FROM beach_layout_versions
       WHERE id = ?
       LIMIT 1`,
      [versionId],
    )
    const versionRow = versionResult.values?.[0] as ParametricLayoutVersionRow | undefined
    if (!versionRow) return null
    return this.getParametricLayoutBundleForVersion(toParametricVersion(versionRow))
  }

  async deleteDraftParametricLayout(versionId: string): Promise<void> {
    const db = await this.getConnection()
    const bundle = await this.getParametricLayoutBundle(versionId)
    if (!bundle || bundle.version.status !== 'draft') {
      throw new Error('Bozza non trovata o non eliminabile.')
    }
    await db.run('DELETE FROM beach_layout_distance_rules WHERE layout_version_id = ?', [versionId])
    await db.run('DELETE FROM beach_layout_zones WHERE layout_version_id = ?', [versionId])
    await db.run('DELETE FROM beach_layout_rows WHERE layout_version_id = ?', [versionId])
    await db.run('DELETE FROM beach_layout_elements WHERE layout_version_id = ?', [versionId])
    await db.run('DELETE FROM beach_layout_versions WHERE id = ? AND status = ?', [versionId, 'draft'])
  }

  async activateDraftParametricLayout(versionId: string): Promise<void> {
    const db = await this.getConnection()
    const draft = await this.getParametricLayoutBundle(versionId)
    if (!draft || draft.version.status !== 'draft') {
      throw new Error('La versione selezionata non è una bozza attivabile.')
    }
    if (draft.elements.length === 0) {
      throw new Error('Attivazione bloccata: bozza senza elementi.')
    }
    const duplicateCodes = new Set<string>()
    const seenCodes = new Set<string>()
    for (const element of draft.elements) {
      if (seenCodes.has(element.code)) duplicateCodes.add(element.code)
      seenCodes.add(element.code)
    }
    if (duplicateCodes.size > 0) {
      throw new Error(`Attivazione bloccata: codici duplicati ${[...duplicateCodes].join(', ')}.`)
    }
    const now = nowIso()
    await db.run("UPDATE beach_layout_versions SET status = 'archived', updated_at = ? WHERE status = 'active'", [now])
    await db.run(
      "UPDATE beach_layout_versions SET status = 'active', updated_at = ?, activated_at = ? WHERE id = ? AND status = 'draft'",
      [now, now, versionId],
    )
  }

  async restoreArchivedParametricLayout(versionId: string): Promise<ParametricLayoutBundle> {
    const archived = await this.getParametricLayoutBundle(versionId)
    if (!archived || archived.version.status !== 'archived') {
      throw new Error('Layout archiviato non trovato.')
    }
    const db = await this.getConnection()
    const now = nowIso()
    const draftVersionId = createEntityId('layout-restore')
    await db.run(
      `INSERT INTO beach_layout_versions
       (id, name, status, source, beach_width_m, beach_depth_m, sea_side, created_at, updated_at, activated_at)
       VALUES (?, ?, 'draft', 'parametric_engine', ?, ?, ?, ?, ?, NULL)`,
      [draftVersionId, `${archived.version.name} · ripristino`, archived.version.beachWidthM, archived.version.beachDepthM, archived.version.seaSide, now, now],
    )
    for (const element of archived.elements) {
      await db.run(
        `INSERT INTO beach_layout_elements
         (id, layout_version_id, legacy_beach_item_id, code, family, row_label, number_index, x_m, y_m,
          width_m, height_m, diameter_m, rotation_deg, zone_id, locked, active, z_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`${draftVersionId}-element-${element.legacyBeachItemId ?? element.id}`, draftVersionId, element.legacyBeachItemId, element.code, element.family, element.rowLabel, element.numberIndex, element.xM, element.yM, element.widthM, element.heightM, element.diameterM, element.rotationDeg, element.zoneId, 0, element.active ? 1 : 0, element.zIndex],
      )
    }
    for (const row of archived.rows) {
      await db.run(
        `INSERT INTO beach_layout_rows
         (id, layout_version_id, row_label, family, item_count, y_m, min_gap_m, distribution_mode, locked)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'uniform', 0)`,
        [`${draftVersionId}-row-${row.rowLabel}`, draftVersionId, row.rowLabel, row.family, row.itemCount, row.yM, row.minGapM],
      )
    }
    for (const zone of archived.zones) {
      await db.run(
        `INSERT INTO beach_layout_zones
         (id, layout_version_id, type, label, x_m, y_m, width_m, height_m, locked, visible)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [`${draftVersionId}-zone-${zone.type}`, draftVersionId, zone.type, zone.label, zone.xM, zone.yM, zone.widthM, zone.heightM, zone.visible ? 1 : 0],
      )
    }
    if (archived.distanceRules) {
      const rules = archived.distanceRules
      await db.run(
        `INSERT INTO beach_layout_distance_rules
         (id, layout_version_id, min_palm_gap_m, min_umbrella_gap_m, min_small_palm_gap_m,
          min_mixed_asset_gap_m, min_palm_row_gap_m, min_umbrella_row_gap_m, min_zone_gap_m,
          margin_from_boundary_m, margin_from_sea_m, margin_from_entrance_m)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`${draftVersionId}-distance-rules`, draftVersionId, rules.minPalmGapM, rules.minUmbrellaGapM, rules.minSmallPalmGapM, rules.minMixedAssetGapM, rules.minPalmRowGapM, rules.minUmbrellaRowGapM, rules.minZoneGapM, rules.marginFromBoundaryM, rules.marginFromSeaM, rules.marginFromEntranceM],
      )
    }
    const draft = await this.getParametricLayoutBundle(draftVersionId)
    if (!draft) throw new Error('Bozza di ripristino non creata.')
    return draft
  }

  async loadParametricSetupDraft(versionId: string): Promise<ParametricSetupState> {
    const db = await this.getConnection()
    const versionResult = await db.query(
      `SELECT id, name, status, beach_width_m, beach_depth_m, sea_side,
        margin_top_m, margin_right_m, margin_bottom_m, margin_left_m
       FROM beach_layout_versions WHERE id = ? LIMIT 1`,
      [versionId],
    )
    const version = versionResult.values?.[0]
    if (!version) throw new Error('Bozza parametrica non trovata.')

    const zonesResult = await db.query(
      `SELECT id, layout_version_id, type, label, x_m, y_m, width_m, height_m, locked, visible
       FROM beach_layout_zones WHERE layout_version_id = ? ORDER BY y_m, x_m`,
      [versionId],
    )
    const rowsResult = await db.query(
      `SELECT id, layout_version_id, row_label, family, item_count, y_m, min_gap_m, distribution_mode,
        zone_id, asset_variant_id, start_margin_m, end_margin_m, distribution_axis, locked
       FROM beach_layout_rows WHERE layout_version_id = ? ORDER BY y_m, row_label`,
      [versionId],
    )
    const rulesResult = await db.query(
      `SELECT id, layout_version_id, min_palm_gap_m, min_umbrella_gap_m, min_small_palm_gap_m,
        min_mixed_asset_gap_m, min_palm_row_gap_m, min_umbrella_row_gap_m, min_zone_gap_m,
        margin_from_boundary_m, margin_from_sea_m, margin_from_entrance_m
       FROM beach_layout_distance_rules WHERE layout_version_id = ? LIMIT 1`,
      [versionId],
    )
    const metricsResult = await db.query(
      `SELECT id, layout_version_id, asset_family, asset_variant_id, label, width_m, height_m,
        diameter_m, collision_shape, spacing_class, locked
       FROM beach_layout_asset_metrics WHERE layout_version_id = ? ORDER BY asset_family, label`,
      [versionId],
    )
    const zones = (zonesResult.values ?? []).map((row) => toParametricZone(row as ParametricLayoutZoneRow))
    const zoneForFamily = (family: string) =>
      zones.find((zone) =>
        family === 'palm' ? zone.type === 'palms' : family === 'umbrella' ? zone.type === 'umbrellas' : zone.type === 'small_palms',
      )?.id ?? zones[0]?.id ?? ''
    const rules = rulesResult.values?.[0]
      ? toParametricDistanceRules(rulesResult.values[0] as ParametricLayoutDistanceRulesRow)
      : null

    return {
      layoutVersionId: String(version.id),
      status: version.status === 'active' ? 'active_view' : 'draft_editing',
      beach: {
        name: String(version.name),
        widthM: Number(version.beach_width_m),
        depthM: Number(version.beach_depth_m),
        seaSide: version.sea_side as ParametricSetupState['beach']['seaSide'],
        marginsM: {
          top: Number(version.margin_top_m ?? 0.5),
          right: Number(version.margin_right_m ?? 0.5),
          bottom: Number(version.margin_bottom_m ?? 0.5),
          left: Number(version.margin_left_m ?? 0.5),
        },
      },
      zones: zones.map((zone) => ({
        id: zone.id,
        label: zone.label,
        type: zone.type,
        xM: zone.xM,
        yM: zone.yM,
        widthM: zone.widthM,
        heightM: zone.heightM,
        locked: zone.locked,
        visible: zone.visible,
        allowedAssetFamilies:
          zone.type === 'palms' ? ['palm'] : zone.type === 'umbrellas' ? ['umbrella'] : zone.type === 'small_palms' ? ['small_palm'] : [],
      })),
      rows: (rowsResult.values ?? []).map((row: any) => ({
        id: String(row.id),
        label: String(row.row_label),
        family: row.family,
        zoneId: String(row.zone_id ?? zoneForFamily(String(row.family))),
        itemCount: Number(row.item_count),
        yM: row.y_m == null ? null : Number(row.y_m),
        minGapM: row.min_gap_m == null ? null : Number(row.min_gap_m),
        distributionMode: row.distribution_mode,
        locked: Number(row.locked) === 1,
        assetVariantId: row.asset_variant_id ?? null,
        startMarginM: Number(row.start_margin_m ?? 0),
        endMarginM: Number(row.end_margin_m ?? 0),
        distributionAxis: (row.distribution_axis ?? 'x') as 'x' | 'y',
      })),
      assetMetrics: (metricsResult.values ?? []).length
        ? (metricsResult.values ?? []).map((row) => toSetupAssetMetric(row as ParametricAssetMetricRow))
        : assetMetricDefinitions.map((metric) => ({ ...metric, locked: true })),
      distanceRules: rules
        ? {
            minPalmGapM: rules.minPalmGapM,
            minUmbrellaGapM: rules.minUmbrellaGapM,
            minSmallPalmGapM: rules.minSmallPalmGapM,
            minMixedAssetGapM: rules.minMixedAssetGapM,
            minPalmRowGapM: rules.minPalmRowGapM,
            minUmbrellaRowGapM: rules.minUmbrellaRowGapM,
            minZoneGapM: rules.minZoneGapM,
            marginFromBoundaryM: rules.marginFromBoundaryM,
            marginFromSeaM: rules.marginFromSeaM,
            marginFromEntranceM: rules.marginFromEntranceM,
          }
        : createDefaultBeachMetricModel().distances,
    }
  }

  async saveParametricSetupDraft(state: ParametricSetupState): Promise<void> {
    const db = await this.getConnection()
    const now = nowIso()
    await db.run(
      `UPDATE beach_layout_versions SET name = ?, beach_width_m = ?, beach_depth_m = ?, sea_side = ?,
        margin_top_m = ?, margin_right_m = ?, margin_bottom_m = ?, margin_left_m = ?, updated_at = ?
       WHERE id = ?`,
      [state.beach.name, state.beach.widthM, state.beach.depthM, state.beach.seaSide, state.beach.marginsM.top, state.beach.marginsM.right, state.beach.marginsM.bottom, state.beach.marginsM.left, now, state.layoutVersionId],
    )
    await db.run('DELETE FROM beach_layout_rows WHERE layout_version_id = ?', [state.layoutVersionId])
    for (const row of state.rows) {
      await db.run(
        `INSERT INTO beach_layout_rows
         (id, layout_version_id, row_label, family, item_count, y_m, min_gap_m, distribution_mode,
          zone_id, asset_variant_id, start_margin_m, end_margin_m, distribution_axis, locked)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [row.id, state.layoutVersionId, row.label, row.family, row.itemCount, row.yM, row.minGapM, row.distributionMode, row.zoneId, row.assetVariantId, row.startMarginM, row.endMarginM, row.distributionAxis, row.locked ? 1 : 0],
      )
    }
    await db.run('DELETE FROM beach_layout_zones WHERE layout_version_id = ?', [state.layoutVersionId])
    for (const zone of state.zones) {
      await db.run(
        `INSERT INTO beach_layout_zones
         (id, layout_version_id, type, label, x_m, y_m, width_m, height_m, locked, visible)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [zone.id, state.layoutVersionId, zone.type, zone.label, zone.xM, zone.yM, zone.widthM, zone.heightM, zone.locked ? 1 : 0, zone.visible ? 1 : 0],
      )
    }
    await db.run('DELETE FROM beach_layout_distance_rules WHERE layout_version_id = ?', [state.layoutVersionId])
    const d = state.distanceRules
    await db.run(
      `INSERT INTO beach_layout_distance_rules
       (id, layout_version_id, min_palm_gap_m, min_umbrella_gap_m, min_small_palm_gap_m,
        min_mixed_asset_gap_m, min_palm_row_gap_m, min_umbrella_row_gap_m, min_zone_gap_m,
        margin_from_boundary_m, margin_from_sea_m, margin_from_entrance_m)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`${state.layoutVersionId}-distance-rules`, state.layoutVersionId, d.minPalmGapM, d.minUmbrellaGapM, d.minSmallPalmGapM, d.minMixedAssetGapM, d.minPalmRowGapM, d.minUmbrellaRowGapM, d.minZoneGapM, d.marginFromBoundaryM, d.marginFromSeaM, d.marginFromEntranceM],
    )
    await db.run('DELETE FROM beach_layout_asset_metrics WHERE layout_version_id = ?', [state.layoutVersionId])
    for (const metric of state.assetMetrics) {
      await db.run(
        `INSERT INTO beach_layout_asset_metrics
         (id, layout_version_id, asset_family, asset_variant_id, label, width_m, height_m,
          diameter_m, collision_shape, spacing_class, locked)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`${state.layoutVersionId}-asset-metric-${metric.assetId}`, state.layoutVersionId, metric.family, metric.assetId, metric.label, metric.defaultWidthM, metric.defaultHeightM, metric.defaultDiameterM ?? null, metric.collisionShape, metric.spacingClass, metric.locked ? 1 : 0],
      )
    }
  }

  async calculateAndSaveParametricDraft(state: ParametricSetupState): Promise<ParametricLayoutOutput> {
    await this.saveParametricSetupDraft(state)
    const existing = await this.getParametricLayoutBundle(state.layoutVersionId)
    const output = calculateParametricLayout({
      beach: state.beach,
      rows: state.rows.map((row) => ({ rowLabel: row.label, family: row.family, itemCount: row.itemCount, zoneId: row.zoneId, yM: row.yM ?? undefined })),
      zones: state.zones.map((zone) => ({ id: zone.id, type: zone.type, xM: zone.xM, yM: zone.yM, widthM: zone.widthM, heightM: zone.heightM })),
      assetMetrics: state.assetMetrics,
      distances: state.distanceRules,
    })
    const db = await this.getConnection()
    await db.run('DELETE FROM beach_layout_elements WHERE layout_version_id = ?', [state.layoutVersionId])
    for (const element of output.elements) {
      const sourceElement = existing?.elements.find((candidate) => candidate.family === element.family && candidate.rowLabel === element.rowLabel && candidate.numberIndex === element.numberIndex)
      await db.run(
        `INSERT INTO beach_layout_elements
         (id, layout_version_id, legacy_beach_item_id, code, family, row_label, number_index, x_m, y_m,
          width_m, height_m, diameter_m, rotation_deg, zone_id, locked, active, z_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?)`,
        [`${state.layoutVersionId}-element-${sourceElement?.legacyBeachItemId ?? `${element.rowLabel}-${element.numberIndex}`}`, state.layoutVersionId, sourceElement?.legacyBeachItemId ?? null, sourceElement?.code ?? element.code, element.family, element.rowLabel, element.numberIndex, element.xM, element.yM, element.widthM, element.heightM, element.diameterM, element.rotationDeg, element.zoneId, element.zIndex],
      )
    }
    await db.run("UPDATE beach_layout_versions SET updated_at = ? WHERE id = ?", [nowIso(), state.layoutVersionId])
    return output
  }

  async createParametricDraftFromActive(): Promise<ParametricLayoutBundle> {
    const existingDraft = await this.getDraftParametricLayoutBundle()
    if (existingDraft) return existingDraft

    const active = await this.getActiveParametricLayoutBundle()
    if (!active) {
      await this.ensureParametricLayoutImported()
    }

    const source = (await this.getActiveParametricLayoutBundle())
    if (!source) {
      throw new Error('Layout parametrico attivo non disponibile.')
    }

    const db = await this.getConnection()
    const now = nowIso()
    const draftVersionId = createEntityId('layout-draft')

    await db.run(
      `INSERT INTO beach_layout_versions
       (id, name, status, source, beach_width_m, beach_depth_m, sea_side, created_at, updated_at, activated_at)
       VALUES (?, ?, 'draft', 'parametric_engine', ?, ?, ?, ?, ?, NULL)`,
      [
        draftVersionId,
        `${source.version.name} · bozza`,
        source.version.beachWidthM,
        source.version.beachDepthM,
        source.version.seaSide,
        now,
        now,
      ],
    )

    const zoneByFamily = new Map([
      ['palm', source.zones.find((zone) => zone.type === 'palms')?.id],
      ['umbrella', source.zones.find((zone) => zone.type === 'umbrellas')?.id],
      ['small_palm', source.zones.find((zone) => zone.type === 'small_palms')?.id],
    ])
    const recalculated = calculateParametricLayout({
      beach: {
        widthM: source.version.beachWidthM,
        depthM: source.version.beachDepthM,
        seaSide: source.version.seaSide,
        marginsM: createDefaultBeachMetricModel().beach.marginsM,
      },
      rows: source.rows.map((row) => ({
        rowLabel: row.rowLabel,
        family: row.family,
        itemCount: row.itemCount,
        zoneId: zoneByFamily.get(row.family) ?? source.zones[0]?.id ?? '',
        yM: row.yM ?? undefined,
      })),
      zones: source.zones.map((zone) => ({
        id: zone.id,
        type: zone.type,
        xM: zone.xM,
        yM: zone.yM,
        widthM: zone.widthM,
        heightM: zone.heightM,
      })),
      distances: source.distanceRules
        ? {
            minPalmGapM: source.distanceRules.minPalmGapM,
            minUmbrellaGapM: source.distanceRules.minUmbrellaGapM,
            minSmallPalmGapM: source.distanceRules.minSmallPalmGapM,
            minMixedAssetGapM: source.distanceRules.minMixedAssetGapM,
            minPalmRowGapM: source.distanceRules.minPalmRowGapM,
            minUmbrellaRowGapM: source.distanceRules.minUmbrellaRowGapM,
            minZoneGapM: source.distanceRules.minZoneGapM,
            marginFromBoundaryM: source.distanceRules.marginFromBoundaryM,
          }
        : createDefaultBeachMetricModel().distances,
    })

    for (const element of recalculated.elements) {
      const sourceElement = source.elements.find(
        (candidate) =>
          candidate.family === element.family &&
          candidate.rowLabel === element.rowLabel &&
          candidate.numberIndex === element.numberIndex,
      )
      await db.run(
        `INSERT INTO beach_layout_elements
         (id, layout_version_id, legacy_beach_item_id, code, family, row_label, number_index, x_m, y_m,
          width_m, height_m, diameter_m, rotation_deg, zone_id, locked, active, z_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?)`,
        [
          `${draftVersionId}-element-${sourceElement?.legacyBeachItemId ?? `${element.rowLabel}-${element.numberIndex}`}`,
          draftVersionId,
          sourceElement?.legacyBeachItemId ?? null,
          sourceElement?.code ?? element.code,
          element.family,
          element.rowLabel,
          element.numberIndex,
          element.xM,
          element.yM,
          element.widthM,
          element.heightM,
          element.diameterM,
          element.rotationDeg,
          element.zoneId,
          element.zIndex,
        ],
      )
    }

    for (const row of source.rows) {
      await db.run(
        `INSERT INTO beach_layout_rows
         (id, layout_version_id, row_label, family, item_count, y_m, min_gap_m, distribution_mode, locked)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'uniform', 0)`,
        [
          `${draftVersionId}-row-${row.rowLabel}`,
          draftVersionId,
          row.rowLabel,
          row.family,
          row.itemCount,
          row.yM,
          row.minGapM,
        ],
      )
    }

    for (const zone of source.zones) {
      await db.run(
        `INSERT INTO beach_layout_zones
         (id, layout_version_id, type, label, x_m, y_m, width_m, height_m, locked, visible)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [
          `${draftVersionId}-zone-${zone.type}`,
          draftVersionId,
          zone.type,
          zone.label,
          zone.xM,
          zone.yM,
          zone.widthM,
          zone.heightM,
          zone.visible ? 1 : 0,
        ],
      )
    }

    if (source.distanceRules) {
      const rules = source.distanceRules
      await db.run(
        `INSERT INTO beach_layout_distance_rules
         (id, layout_version_id, min_palm_gap_m, min_umbrella_gap_m, min_small_palm_gap_m,
          min_mixed_asset_gap_m, min_palm_row_gap_m, min_umbrella_row_gap_m, min_zone_gap_m,
          margin_from_boundary_m, margin_from_sea_m, margin_from_entrance_m)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${draftVersionId}-distance-rules`,
          draftVersionId,
          rules.minPalmGapM,
          rules.minUmbrellaGapM,
          rules.minSmallPalmGapM,
          rules.minMixedAssetGapM,
          rules.minPalmRowGapM,
          rules.minUmbrellaRowGapM,
          rules.minZoneGapM,
          rules.marginFromBoundaryM,
          rules.marginFromSeaM,
          rules.marginFromEntranceM,
        ],
      )
    }

    const draft = await this.getDraftParametricLayoutBundle()
    if (!draft) {
      throw new Error('Bozza parametrica non trovata dopo la creazione.')
    }
    return draft
  }

  private async getParametricLayoutBundleForVersion(
    version: BeachLayoutVersion,
  ): Promise<ParametricLayoutBundle> {
    const db = await this.getConnection()
    const elementsResult = await db.query(
      `SELECT id, layout_version_id, legacy_beach_item_id, code, family, row_label, number_index,
        x_m, y_m, width_m, height_m, diameter_m, rotation_deg, zone_id, locked, active, z_index
       FROM beach_layout_elements
       WHERE layout_version_id = ? AND active = 1
       ORDER BY z_index, row_label, number_index`,
      [version.id],
    )
    const rowsResult = await db.query(
      `SELECT id, layout_version_id, row_label, family, item_count, y_m, min_gap_m, distribution_mode, locked
       FROM beach_layout_rows
       WHERE layout_version_id = ?
       ORDER BY y_m, row_label`,
      [version.id],
    )
    const zonesResult = await db.query(
      `SELECT id, layout_version_id, type, label, x_m, y_m, width_m, height_m, locked, visible
       FROM beach_layout_zones
       WHERE layout_version_id = ?
       ORDER BY y_m, x_m`,
      [version.id],
    )
    const distanceResult = await db.query(
      `SELECT id, layout_version_id, min_palm_gap_m, min_umbrella_gap_m, min_small_palm_gap_m,
        min_mixed_asset_gap_m, min_palm_row_gap_m, min_umbrella_row_gap_m, min_zone_gap_m,
        margin_from_boundary_m, margin_from_sea_m, margin_from_entrance_m
       FROM beach_layout_distance_rules
       WHERE layout_version_id = ?
       LIMIT 1`,
      [version.id],
    )

    return {
      version,
      elements: (elementsResult.values ?? []).map((row) =>
        toParametricElement(row as ParametricLayoutElementRow),
      ),
      rows: (rowsResult.values ?? []).map((row) => toParametricRow(row as ParametricLayoutRowRow)),
      zones: (zonesResult.values ?? []).map((row) => toParametricZone(row as ParametricLayoutZoneRow)),
      distanceRules: distanceResult.values?.[0]
        ? toParametricDistanceRules(distanceResult.values[0] as ParametricLayoutDistanceRulesRow)
        : null,
    }
  }

  private async getParametricLayoutBundleByStatus(
    status: BeachLayoutVersion['status'],
  ): Promise<ParametricLayoutBundle | null> {
    const db = await this.getConnection()
    const versionResult = await db.query(
      `SELECT id, name, status, source, beach_width_m, beach_depth_m, sea_side,
        created_at, updated_at, activated_at
       FROM beach_layout_versions
       WHERE status = ?
       ORDER BY updated_at DESC
       LIMIT 1`,
      [status],
    )
    const versionRow = versionResult.values?.[0] as ParametricLayoutVersionRow | undefined
    if (!versionRow) return null

    return this.getParametricLayoutBundleForVersion(toParametricVersion(versionRow))
  }

  async createCustomer(input: CustomerInput): Promise<Customer> {
    const fullName = input.fullName.trim()

    if (!fullName) {
      throw new Error('Nome cliente obbligatorio')
    }

    const db = await this.getConnection()
    const now = nowIso()
    const id = createEntityId('customer')
    await db.run(
      `INSERT INTO customers
       (id, full_name, phone, email, notes, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        id,
        fullName,
        input.phone?.trim() || null,
        input.email?.trim() || null,
        input.notes?.trim() || null,
        now,
        now,
      ],
    )

    const customer = await this.getCustomer(id)

    if (!customer) {
      throw new Error('Cliente non trovato dopo il salvataggio.')
    }

    return customer
  }

  async updateCustomer(customerId: string, input: CustomerInput): Promise<Customer> {
    const fullName = input.fullName.trim()

    if (!fullName) {
      throw new Error('Nome cliente obbligatorio')
    }

    const db = await this.getConnection()
    await db.run(
      `UPDATE customers
       SET full_name = ?, phone = ?, email = ?, notes = ?, updated_at = ?
       WHERE id = ? AND active = 1`,
      [
        fullName,
        input.phone?.trim() || null,
        input.email?.trim() || null,
        input.notes?.trim() || null,
        nowIso(),
        customerId,
      ],
    )

    const customer = await this.getCustomer(customerId)

    if (!customer) {
      throw new Error('Cliente non trovato.')
    }

    return customer
  }

  async getCustomer(customerId: string): Promise<Customer | null> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, full_name, phone, email, notes, active, created_at, updated_at
       FROM customers
       WHERE id = ? AND active = 1
       LIMIT 1`,
      [customerId],
    )
    const row = result.values?.[0] as CustomerRow | undefined
    return row ? toCustomer(row) : null
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const db = await this.getConnection()
    const normalized = `%${query.trim().toLowerCase()}%`
    const result = await db.query(
      `SELECT id, full_name, phone, email, notes, active, created_at, updated_at
       FROM customers
       WHERE active = 1
         AND (? = '%%'
           OR lower(full_name) LIKE ?
           OR lower(COALESCE(phone, '')) LIKE ?
           OR lower(COALESCE(email, '')) LIKE ?)
       ORDER BY full_name COLLATE NOCASE
       LIMIT 50`,
      [normalized, normalized, normalized, normalized],
    )
    return (result.values ?? []).map((row) => toCustomer(row as CustomerRow))
  }

  async getActiveCustomers(): Promise<Customer[]> {
    return this.searchCustomers('')
  }

  async assignCustomerToBeachItem(
    itemId: string,
    customerId: string,
    assignmentType: CustomerAssignmentType,
    note = '',
  ): Promise<void> {
    const db = await this.getConnection()
    const now = nowIso()
    await db.run(
      `UPDATE beach_item_customer_assignments
       SET active = 0, unassigned_at = ?, updated_at = ?
       WHERE item_id = ? AND active = 1`,
      [now, now, itemId],
    )
    await db.run(
      `INSERT INTO beach_item_customer_assignments
       (id, item_id, customer_id, assignment_type, active, assigned_at, unassigned_at, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, NULL, ?, ?, ?)`,
      [
        createEntityId('assignment'),
        itemId,
        customerId,
        assignmentType,
        now,
        note.trim() || null,
        now,
        now,
      ],
    )

    const currentStatus = await this.getBeachItemStatus(db, itemId)
    if (currentStatus === 'free') {
      await this.updateBeachItemStatus(itemId, 'occupied')
    }
  }

  async unassignCustomerFromBeachItem(itemId: string): Promise<void> {
    const db = await this.getConnection()
    const now = nowIso()
    await db.run(
      `UPDATE beach_item_customer_assignments
       SET active = 0, unassigned_at = ?, updated_at = ?
       WHERE item_id = ? AND active = 1`,
      [now, now, itemId],
    )

    const currentStatus = await this.getBeachItemStatus(db, itemId)
    if (currentStatus === 'occupied') {
      await this.updateBeachItemStatus(itemId, 'free')
    }
  }

  async getAssignedCustomerForItem(itemId: string): Promise<BeachItemAssignedCustomer | null> {
    const assignments = await this.getAssignedCustomersForItems([itemId])
    return assignments[0] ?? null
  }

  async getAssignedCustomersForItems(itemIds: string[]): Promise<BeachItemAssignedCustomer[]> {
    if (itemIds.length === 0) {
      return []
    }

    const db = await this.getConnection()
    const placeholders = itemIds.map(() => '?').join(', ')
    const result = await db.query(
      `SELECT
         a.id AS assignment_id,
         a.item_id,
         a.customer_id,
         a.assignment_type,
         a.active AS assignment_active,
         a.assigned_at,
         a.unassigned_at,
         a.note AS assignment_note,
         a.created_at AS assignment_created_at,
         a.updated_at AS assignment_updated_at,
         c.id AS customer_id_value,
         c.full_name,
         c.phone,
         c.email,
         c.notes,
         c.active AS customer_active,
         c.created_at AS customer_created_at,
         c.updated_at AS customer_updated_at
       FROM beach_item_customer_assignments a
       JOIN customers c ON c.id = a.customer_id
       WHERE a.active = 1 AND c.active = 1 AND a.item_id IN (${placeholders})`,
      itemIds,
    )

    return (result.values ?? []).map((row) => {
      const value = row as Record<string, unknown>
      return {
        itemId: String(value.item_id),
        customer: toCustomer({
          id: String(value.customer_id_value),
          full_name: String(value.full_name),
          phone: value.phone as string | null,
          email: value.email as string | null,
          notes: value.notes as string | null,
          active: Number(value.customer_active),
          created_at: String(value.customer_created_at),
          updated_at: String(value.customer_updated_at),
        }),
        assignment: toAssignment({
          id: String(value.assignment_id),
          item_id: String(value.item_id),
          customer_id: String(value.customer_id),
          assignment_type: value.assignment_type as CustomerAssignmentType,
          active: Number(value.assignment_active),
          assigned_at: String(value.assigned_at),
          unassigned_at: value.unassigned_at as string | null,
          note: value.assignment_note as string | null,
          created_at: String(value.assignment_created_at),
          updated_at: String(value.assignment_updated_at),
        }),
      }
    })
  }

  async getCustomerAssignments(customerId: string): Promise<BeachItemCustomerAssignment[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, item_id, customer_id, assignment_type, active, assigned_at, unassigned_at, note, created_at, updated_at
       FROM beach_item_customer_assignments
       WHERE customer_id = ?
       ORDER BY assigned_at DESC`,
      [customerId],
    )
    return (result.values ?? []).map((row) => toAssignment(row as CustomerAssignmentRow))
  }

  async createAccountForAssignment(input: AccountInput): Promise<Account> {
    const db = await this.getConnection()
    const now = nowIso()
    const id = createEntityId('account')
    const totalAmountCents = Math.max(0, input.totalAmountCents)
    const status = calculateAccountStatus(totalAmountCents, 0)

    await db.run(
      `INSERT INTO accounts
       (id, item_id, customer_id, assignment_id, account_type, season_label, base_amount_cents,
        extras_amount_cents, total_amount_cents, paid_amount_cents, balance_amount_cents, status,
        notes, active, opened_at, closed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?, ?, ?, 1, ?, NULL, ?, ?)`,
      [
        id,
        input.itemId,
        input.customerId,
        input.assignmentId ?? null,
        input.accountType,
        input.seasonLabel?.trim() || null,
        totalAmountCents,
        totalAmountCents,
        totalAmountCents,
        status,
        input.notes?.trim() || null,
        now,
        now,
        now,
      ],
    )

    const account = await this.getAccountById(db, id)
    if (!account) {
      throw new Error('Conto non trovato dopo la creazione.')
    }
    return account
  }

  async getActiveAccountForItem(itemId: string): Promise<Account | null> {
    const accounts = await this.getActiveAccountsForItems([itemId])
    return accounts[0] ?? null
  }

  async getAccount(accountId: string): Promise<Account | null> {
    const db = await this.getConnection()
    return this.getAccountById(db, accountId)
  }

  async getActiveAccountsForItems(itemIds: string[]): Promise<Account[]> {
    if (itemIds.length === 0) {
      return []
    }

    const db = await this.getConnection()
    const placeholders = itemIds.map(() => '?').join(', ')
    const result = await db.query(
      `SELECT id, item_id, customer_id, assignment_id, account_type, season_label,
        base_amount_cents, extras_amount_cents, total_amount_cents, paid_amount_cents, balance_amount_cents, status, notes, active,
        opened_at, closed_at, created_at, updated_at
       FROM accounts
       WHERE active = 1 AND item_id IN (${placeholders})
       ORDER BY opened_at DESC`,
      itemIds,
    )

    return (result.values ?? []).map((row) => toAccount(row as AccountRow))
  }

  async getAccountsForCustomer(customerId: string): Promise<Account[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, item_id, customer_id, assignment_id, account_type, season_label,
        base_amount_cents, extras_amount_cents, total_amount_cents, paid_amount_cents, balance_amount_cents, status, notes, active,
        opened_at, closed_at, created_at, updated_at
       FROM accounts
       WHERE customer_id = ?
       ORDER BY opened_at DESC`,
      [customerId],
    )
    return (result.values ?? []).map((row) => toAccount(row as AccountRow))
  }

  async updateAccountTotal(accountId: string, totalAmountCents: number, notes?: string | null): Promise<Account> {
    const db = await this.getConnection()
    const current = await this.getAccountById(db, accountId)
    if (!current) {
      throw new Error('Conto non trovato.')
    }

    const baseAmountCents = Math.max(0, totalAmountCents)
    const normalizedTotal = baseAmountCents + current.extrasAmountCents
    const balanceAmountCents = normalizedTotal - current.paidAmountCents
    const status = calculateAccountStatus(normalizedTotal, current.paidAmountCents, current.status)
    await db.run(
      `UPDATE accounts
       SET base_amount_cents = ?, total_amount_cents = ?, balance_amount_cents = ?, status = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      [baseAmountCents, normalizedTotal, balanceAmountCents, status, notes?.trim() || current.notes, nowIso(), accountId],
    )

    return this.requireAccount(db, accountId)
  }

  async addPayment(
    accountId: string,
    amountCents: number,
    paymentMethod: PaymentMethod,
    note = '',
  ): Promise<Payment> {
    if (amountCents <= 0) {
      throw new Error('Importo non valido')
    }

    const db = await this.getConnection()
    const now = nowIso()
    const id = createEntityId('payment')
    await db.run(
      `INSERT INTO payments
       (id, account_id, amount_cents, payment_method, paid_at, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, accountId, amountCents, paymentMethod, now, note.trim() || null, now],
    )
    await this.recalculateAccountBalance(accountId)

    const result = await db.query(
      `SELECT id, account_id, amount_cents, payment_method, paid_at, note, created_at
       FROM payments WHERE id = ?`,
      [id],
    )
    const row = result.values?.[0] as PaymentRow | undefined
    if (!row) {
      throw new Error('Pagamento non trovato dopo il salvataggio.')
    }
    return toPayment(row)
  }

  async getPaymentsForAccount(accountId: string): Promise<Payment[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, account_id, amount_cents, payment_method, paid_at, note, created_at
       FROM payments
       WHERE account_id = ?
       ORDER BY paid_at DESC`,
      [accountId],
    )
    return (result.values ?? []).map((row) => toPayment(row as PaymentRow))
  }

  async recalculateAccountBalance(accountId: string): Promise<Account> {
    const db = await this.getConnection()
    const current = await this.requireAccount(db, accountId)
    const paymentResult = await db.query(
      'SELECT COALESCE(SUM(amount_cents), 0) AS paid FROM payments WHERE account_id = ?',
      [accountId],
    )
    const paidAmountCents = Number(paymentResult.values?.[0]?.paid ?? 0)
    const balanceAmountCents = current.totalAmountCents - paidAmountCents
    const status = calculateAccountStatus(current.totalAmountCents, paidAmountCents, current.status)
    await db.run(
      `UPDATE accounts
       SET paid_amount_cents = ?, balance_amount_cents = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [paidAmountCents, balanceAmountCents, status, nowIso(), accountId],
    )

    return this.requireAccount(db, accountId)
  }

  async recalculateAccountTotalWithExtras(accountId: string): Promise<Account> {
    const db = await this.getConnection()
    const current = await this.requireAccount(db, accountId)
    const extraResult = await db.query(
      'SELECT COALESCE(SUM(total_amount_cents), 0) AS extras FROM account_extra_items WHERE account_id = ? AND active = 1',
      [accountId],
    )
    const extrasAmountCents = Number(extraResult.values?.[0]?.extras ?? 0)
    const totalAmountCents = current.baseAmountCents + extrasAmountCents
    const balanceAmountCents = totalAmountCents - current.paidAmountCents
    const status = calculateAccountStatus(totalAmountCents, current.paidAmountCents, current.status)
    await db.run(
      `UPDATE accounts
       SET extras_amount_cents = ?, total_amount_cents = ?, balance_amount_cents = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [extrasAmountCents, totalAmountCents, balanceAmountCents, status, nowIso(), accountId],
    )
    return this.requireAccount(db, accountId)
  }

  async closeAccount(accountId: string): Promise<Account> {
    const db = await this.getConnection()
    await db.run('UPDATE accounts SET active = 0, closed_at = ?, updated_at = ? WHERE id = ?', [
      nowIso(),
      nowIso(),
      accountId,
    ])
    return this.requireAccount(db, accountId)
  }

  async cancelAccount(accountId: string): Promise<Account> {
    const db = await this.getConnection()
    await db.run(
      `UPDATE accounts
       SET status = 'cancelled', active = 0, closed_at = ?, updated_at = ?
       WHERE id = ?`,
      [nowIso(), nowIso(), accountId],
    )
    return this.requireAccount(db, accountId)
  }

  async createReservation(input: ReservationInput): Promise<Reservation> {
    this.validateReservationInput(input)
    const available = await this.checkItemAvailability(input.itemId, input.startDate, input.endDate)
    if (!available) {
      throw new Error('Il posto è già prenotato in questo periodo.')
    }

    const db = await this.getConnection()
    const now = nowIso()
    const id = createEntityId('reservation')
    await db.run(
      `INSERT INTO reservations
       (id, item_id, customer_id, assignment_id, account_id, reservation_type, start_date, end_date,
        status, title, notes, active, source, booking_mode, booking_status, period_type,
        sync_state, version, folio_id, created_at, updated_at, cancelled_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, 1, 'operator', 'operator_app',
        'active', ?, 'local', 1, ?, ?, ?, NULL)`,
      [
        id,
        input.itemId,
        input.customerId,
        input.assignmentId ?? null,
        input.accountId ?? null,
        input.reservationType,
        input.startDate,
        input.endDate,
        input.title?.trim() || null,
        input.notes?.trim() || null,
        input.reservationType,
        input.accountId ?? null,
        now,
        now,
      ],
    )
    return this.requireReservation(db, id)
  }

  async updateReservation(reservationId: string, input: ReservationInput): Promise<Reservation> {
    this.validateReservationInput(input)
    const available = await this.checkItemAvailability(
      input.itemId,
      input.startDate,
      input.endDate,
      reservationId,
    )
    if (!available) {
      throw new Error('Il posto è già prenotato in questo periodo.')
    }

    const db = await this.getConnection()
    await db.run(
      `UPDATE reservations
       SET item_id = ?, customer_id = ?, assignment_id = ?, account_id = ?, reservation_type = ?,
        start_date = ?, end_date = ?, title = ?, notes = ?, booking_status = status,
        period_type = ?, folio_id = ?, version = version + 1, updated_at = ?
       WHERE id = ? AND active = 1`,
      [
        input.itemId,
        input.customerId,
        input.assignmentId ?? null,
        input.accountId ?? null,
        input.reservationType,
        input.startDate,
        input.endDate,
        input.title?.trim() || null,
        input.notes?.trim() || null,
        input.reservationType,
        input.accountId ?? null,
        nowIso(),
        reservationId,
      ],
    )
    return this.requireReservation(db, reservationId)
  }

  async cancelReservation(reservationId: string): Promise<Reservation> {
    const db = await this.getConnection()
    const now = nowIso()
    await db.run(
      `UPDATE reservations
       SET status = 'cancelled', booking_status = 'cancelled', active = 0,
        cancelled_at = ?, deleted_at = ?, version = version + 1, updated_at = ?
       WHERE id = ?`,
      [now, now, now, reservationId],
    )
    return this.requireReservation(db, reservationId)
  }

  async getReservation(reservationId: string): Promise<Reservation | null> {
    const db = await this.getConnection()
    return this.getReservationById(db, reservationId)
  }

  async getReservationsForItem(itemId: string): Promise<Reservation[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, item_id, customer_id, assignment_id, account_id, reservation_type, start_date,
        end_date, status, title, notes, active, created_at, updated_at, cancelled_at
       FROM reservations
       WHERE item_id = ?
       ORDER BY start_date DESC`,
      [itemId],
    )
    return (result.values ?? []).map((row) => toReservation(row as ReservationRow))
  }

  async getActiveReservationsForItem(itemId: string): Promise<Reservation[]> {
    return (await this.getReservationsForItem(itemId)).filter(
      (reservation) => reservation.active && ['draft', 'active'].includes(reservation.status),
    )
  }

  async getReservationsForCustomer(customerId: string): Promise<Reservation[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, item_id, customer_id, assignment_id, account_id, reservation_type, start_date,
        end_date, status, title, notes, active, created_at, updated_at, cancelled_at
       FROM reservations
       WHERE customer_id = ?
       ORDER BY start_date DESC`,
      [customerId],
    )
    return (result.values ?? []).map((row) => toReservation(row as ReservationRow))
  }

  async getReservationsByDateRange(startDate: string, endDate: string): Promise<Reservation[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, item_id, customer_id, assignment_id, account_id, reservation_type, start_date,
        end_date, status, title, notes, active, created_at, updated_at, cancelled_at
       FROM reservations
       WHERE active = 1 AND status IN ('draft', 'active') AND start_date <= ? AND ? <= end_date
       ORDER BY start_date ASC`,
      [endDate, startDate],
    )
    return (result.values ?? []).map((row) => toReservation(row as ReservationRow))
  }

  async checkItemAvailability(
    itemId: string,
    startDate: string,
    endDate: string,
    excludeReservationId?: string,
  ): Promise<boolean> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT COUNT(*) AS count
       FROM reservations
       WHERE item_id = ?
         AND active = 1
         AND status IN ('draft', 'active')
         AND start_date <= ?
         AND ? <= end_date
         AND (? IS NULL OR id != ?)`,
      [itemId, endDate, startDate, excludeReservationId ?? null, excludeReservationId ?? null],
    )
    return Number(result.values?.[0]?.count ?? 0) === 0
  }

  async getCurrentReservationForItem(itemId: string, date = getTodayIsoDate()): Promise<Reservation | null> {
    const reservations = await this.getCurrentReservationsForItems([itemId], date)
    return reservations[0] ?? null
  }

  async getCurrentReservationsForItems(
    itemIds: string[],
    date = getTodayIsoDate(),
  ): Promise<Reservation[]> {
    if (itemIds.length === 0) {
      return []
    }

    const db = await this.getConnection()
    const placeholders = itemIds.map(() => '?').join(', ')
    const result = await db.query(
      `SELECT id, item_id, customer_id, assignment_id, account_id, reservation_type, start_date,
        end_date, status, title, notes, active, created_at, updated_at, cancelled_at
       FROM reservations
       WHERE active = 1
         AND status IN ('draft', 'active')
         AND item_id IN (${placeholders})
         AND start_date <= ?
         AND ? <= end_date
       ORDER BY start_date ASC`,
      [...itemIds, date, date],
    )
    return (result.values ?? []).map((row) => toReservation(row as ReservationRow))
  }

  async getUpcomingReservationsForItem(itemId: string, limit = 3): Promise<Reservation[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, item_id, customer_id, assignment_id, account_id, reservation_type, start_date,
        end_date, status, title, notes, active, created_at, updated_at, cancelled_at
       FROM reservations
       WHERE item_id = ? AND active = 1 AND status IN ('draft', 'active') AND start_date >= ?
       ORDER BY start_date ASC
       LIMIT ?`,
      [itemId, getTodayIsoDate(), limit],
    )
    return (result.values ?? []).map((row) => toReservation(row as ReservationRow))
  }

  async listBookingRequests(): Promise<BookingRequestRecord[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, workspace_id, source, status, pairing_status, customer_payload_json,
        matched_customer_id, pairing_decision_json, pairing_resolved_at,
        requested_period_json, requested_item_id, requested_item_type, requested_extras_json,
        converted_reservation_id, created_at, updated_at, deleted_at, sync_state, remote_id, version
       FROM booking_requests
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC`,
    )
    return (result.values ?? []).map((row) => toBookingRequest(row as BookingRequestRow))
  }

  async createBookingRequest(input: BookingRequestInput): Promise<BookingRequestRecord> {
    const db = await this.getConnection()
    const now = nowIso()
    const id = input.id ?? createEntityId('booking-request')
    await db.run(
      `INSERT INTO booking_requests
       (id, workspace_id, source, status, pairing_status, matched_customer_id,
        pairing_decision_json, pairing_resolved_at, customer_payload_json,
        requested_period_json, requested_item_id, requested_item_type, requested_extras_json,
        converted_reservation_id, created_at, updated_at, deleted_at, sync_state, remote_id, version)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?, ?, ?, ?, NULL, ?, ?, NULL, 'local', NULL, 1)`,
      [
        id,
        input.workspaceId ?? null,
        input.source,
        input.status ?? 'new',
        input.pairingStatus ?? 'unpaired',
        serializeJsonField(input.customerPayload),
        serializeJsonField(input.requestedPeriod),
        input.requestedItemId ?? null,
        input.requestedItemType ?? null,
        serializeJsonField(input.requestedExtras ?? []),
        now,
        now,
      ],
    )
    const requests = await this.listBookingRequests()
    return this.requireBookingRequest(requests, id)
  }

  async getBookingRequestById(requestId: string): Promise<BookingRequestRecord | null> {
    const requests = await this.listBookingRequests()
    return requests.find((request) => request.id === requestId) ?? null
  }

  async updateBookingRequestStatus(
    requestId: string,
    status: BookingRequestStatus,
  ): Promise<BookingRequestRecord> {
    const db = await this.getConnection()
    await db.run(
      'UPDATE booking_requests SET status = ?, updated_at = ?, version = version + 1 WHERE id = ?',
      [status, nowIso(), requestId],
    )
    return this.requireBookingRequest(await this.listBookingRequests(), requestId)
  }

  async listPairingCandidates(
    requestId: string,
  ): Promise<BookingCustomerPairingCandidateRecord[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, request_id, existing_customer_id, score, confidence, reasons_json,
        matched_fields_json, created_at
       FROM booking_customer_pairing_candidates
       WHERE request_id = ?
       ORDER BY score DESC, created_at ASC`,
      [requestId],
    )
    return (result.values ?? []).map((row) =>
      toBookingCustomerPairingCandidate(row as BookingCustomerPairingCandidateRow),
    )
  }

  async replacePairingCandidates(
    requestId: string,
    candidates: BookingCustomerPairingCandidateRecord[],
  ): Promise<BookingCustomerPairingCandidateRecord[]> {
    const db = await this.getConnection()
    await db.run('DELETE FROM booking_customer_pairing_candidates WHERE request_id = ?', [requestId])
    if (candidates.length > 0) {
      await db.executeSet(
        candidates.map((candidate) => ({
          statement: `INSERT INTO booking_customer_pairing_candidates
            (id, request_id, existing_customer_id, score, confidence, reasons_json,
             matched_fields_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          values: [
            candidate.id,
            requestId,
            candidate.existingCustomerId,
            candidate.score,
            candidate.confidence,
            serializeJsonField(candidate.reasons),
            serializeJsonField(candidate.matchedFields),
            candidate.createdAt,
          ],
        })),
      )
    }
    return this.listPairingCandidates(requestId)
  }

  async updateBookingRequestPairingStatus(
    requestId: string,
    pairingStatus: BookingCustomerPairingStatus,
  ): Promise<BookingRequestRecord> {
    const db = await this.getConnection()
    await db.run(
      'UPDATE booking_requests SET pairing_status = ?, updated_at = ?, version = version + 1 WHERE id = ?',
      [pairingStatus, nowIso(), requestId],
    )
    return this.requireBookingRequest(await this.listBookingRequests(), requestId)
  }

  async resolveBookingRequestPairing(
    decision: BookingCustomerPairingDecision,
  ): Promise<BookingRequestRecord> {
    const db = await this.getConnection()
    const decidedAt = decision.decidedAt ?? nowIso()
    const pairingStatus: BookingCustomerPairingStatus =
      decision.decision === 'match_existing'
        ? 'matched_existing'
        : decision.decision === 'create_new'
          ? 'manually_resolved'
          : decision.decision === 'reject'
            ? 'rejected'
            : 'unpaired'
    const status: BookingRequestStatus | null = decision.decision === 'reject' ? 'rejected' : null

    await db.run(
      `UPDATE booking_requests
       SET pairing_status = ?,
           matched_customer_id = ?,
           pairing_decision_json = ?,
           pairing_resolved_at = ?,
           status = COALESCE(?, status),
           updated_at = ?,
           version = version + 1
       WHERE id = ?`,
      [
        pairingStatus,
        decision.decision === 'match_existing' || decision.decision === 'create_new'
          ? decision.existingCustomerId ?? null
          : null,
        serializeJsonField({ ...decision, decidedAt }),
        decidedAt,
        status,
        nowIso(),
        decision.requestId,
      ],
    )
    return this.requireBookingRequest(await this.listBookingRequests(), decision.requestId)
  }

  async listBookingStatusEvents(filters: {
    reservationId?: string
    requestId?: string
  } = {}): Promise<BookingStatusEventRecord[]> {
    const db = await this.getConnection()
    const clauses: string[] = []
    const values: string[] = []
    if (filters.reservationId) {
      clauses.push('reservation_id = ?')
      values.push(filters.reservationId)
    }
    if (filters.requestId) {
      clauses.push('request_id = ?')
      values.push(filters.requestId)
    }
    const result = await db.query(
      `SELECT id, reservation_id, request_id, from_status, to_status, source, reason,
        payload_json, created_at, created_by, device_id
       FROM booking_status_events
       ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
       ORDER BY created_at DESC`,
      values,
    )
    return (result.values ?? []).map((row) => toBookingStatusEvent(row as BookingStatusEventRow))
  }

  async appendBookingStatusEvent(input: BookingStatusEventInput): Promise<BookingStatusEventRecord> {
    const db = await this.getConnection()
    const createdAt = input.createdAt ?? nowIso()
    const id = input.id ?? createEntityId('booking-status-event')
    await db.run(
      `INSERT INTO booking_status_events
       (id, reservation_id, request_id, from_status, to_status, source, reason, payload_json,
        created_at, created_by, device_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.reservationId ?? null,
        input.requestId ?? null,
        input.fromStatus ?? null,
        input.toStatus,
        input.source,
        input.reason ?? null,
        input.payload == null ? null : serializeJsonField(input.payload),
        createdAt,
        input.createdBy ?? null,
        input.deviceId ?? null,
      ],
    )
    return this.requireBookingStatusEvent(await this.listBookingStatusEvents(), id)
  }

  async listBookingConflicts(filters: {
    reservationId?: string
    requestId?: string
    status?: BookingConflictRecord['status']
  } = {}): Promise<BookingConflictRecord[]> {
    const db = await this.getConnection()
    const clauses: string[] = []
    const values: string[] = []
    if (filters.reservationId) {
      clauses.push('reservation_id = ?')
      values.push(filters.reservationId)
    }
    if (filters.requestId) {
      clauses.push('request_id = ?')
      values.push(filters.requestId)
    }
    if (filters.status) {
      clauses.push('status = ?')
      values.push(filters.status)
    }
    const result = await db.query(
      `SELECT id, reservation_id, request_id, conflict_type, severity, affected_item_ids_json,
        affected_period_json, message, status, created_at, resolved_at
       FROM booking_conflicts
       ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
       ORDER BY created_at DESC`,
      values,
    )
    return (result.values ?? []).map((row) => toBookingConflict(row as BookingConflictRow))
  }

  async createBookingConflict(input: BookingConflictInput): Promise<BookingConflictRecord> {
    const db = await this.getConnection()
    const id = input.id ?? createEntityId('booking-conflict')
    const createdAt = input.createdAt ?? nowIso()
    await db.run(
      `INSERT INTO booking_conflicts
       (id, reservation_id, request_id, conflict_type, severity, affected_item_ids_json,
        affected_period_json, message, status, created_at, resolved_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [
        id,
        input.reservationId ?? null,
        input.requestId ?? null,
        input.conflictType,
        input.severity,
        serializeJsonField(input.affectedItemIds),
        serializeJsonField(input.affectedPeriod),
        input.message,
        input.status ?? 'open',
        createdAt,
      ],
    )
    return this.requireBookingConflict(await this.listBookingConflicts(), id)
  }

  async resolveBookingConflict(conflictId: string): Promise<BookingConflictRecord> {
    const db = await this.getConnection()
    await db.run(
      "UPDATE booking_conflicts SET status = 'resolved', resolved_at = ? WHERE id = ?",
      [nowIso(), conflictId],
    )
    return this.requireBookingConflict(await this.listBookingConflicts(), conflictId)
  }

  async listAvailabilityLocks(filters: {
    itemId?: string
    status?: AvailabilityLockRecord['status']
  } = {}): Promise<AvailabilityLockRecord[]> {
    const db = await this.getConnection()
    const clauses: string[] = []
    const values: string[] = []
    if (filters.itemId) {
      clauses.push('item_id = ?')
      values.push(filters.itemId)
    }
    if (filters.status) {
      clauses.push('status = ?')
      values.push(filters.status)
    }
    const result = await db.query(
      `SELECT id, workspace_id, item_id, period_json, source, reservation_id, request_id,
        status, expires_at, created_at, updated_at
       FROM availability_locks
       ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
       ORDER BY created_at DESC`,
      values,
    )
    return (result.values ?? []).map((row) => toAvailabilityLock(row as AvailabilityLockRow))
  }

  async createAvailabilityLock(input: AvailabilityLockInput): Promise<AvailabilityLockRecord> {
    const db = await this.getConnection()
    const now = nowIso()
    const id = input.id ?? createEntityId('availability-lock')
    await db.run(
      `INSERT INTO availability_locks
       (id, workspace_id, item_id, period_json, source, reservation_id, request_id, status,
        expires_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.workspaceId ?? null,
        input.itemId,
        serializeJsonField(input.period),
        input.source,
        input.reservationId ?? null,
        input.requestId ?? null,
        input.status ?? 'active',
        input.expiresAt ?? null,
        input.createdAt ?? now,
        input.updatedAt ?? now,
      ],
    )
    return this.requireAvailabilityLock(await this.listAvailabilityLocks(), id)
  }

  async releaseAvailabilityLock(lockId: string): Promise<AvailabilityLockRecord> {
    const db = await this.getConnection()
    await db.run(
      "UPDATE availability_locks SET status = 'released', updated_at = ? WHERE id = ?",
      [nowIso(), lockId],
    )
    return this.requireAvailabilityLock(await this.listAvailabilityLocks(), lockId)
  }

  async createPricingSnapshot(input: PricingSnapshotInput): Promise<PricingSnapshotRecord> {
    const db = await this.getConnection()
    const now = nowIso()
    const id = input.id ?? createEntityId('pricing-snapshot')
    await db.run(
      `INSERT INTO pricing_snapshots
       (id, reservation_id, source_rule_id, catalog_item_id, period_type, scope_json,
        base_price, extras_total, included_items_json, calculated_total, manual_override_json,
        created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.reservationId ?? null,
        input.sourceRuleId ?? null,
        input.catalogItemId ?? null,
        input.periodType,
        input.scope == null ? null : serializeJsonField(input.scope),
        input.basePrice,
        input.extrasTotal,
        serializeJsonField(input.includedItems),
        input.calculatedTotal,
        input.manualOverride == null ? null : serializeJsonField(input.manualOverride),
        input.createdAt ?? now,
        input.updatedAt ?? now,
      ],
    )
    return this.getRequiredPricingSnapshot(id)
  }

  async getPricingSnapshotById(snapshotId: string): Promise<PricingSnapshotRecord | null> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, reservation_id, source_rule_id, catalog_item_id, period_type, scope_json,
        base_price, extras_total, included_items_json, calculated_total, manual_override_json,
        created_at, updated_at
       FROM pricing_snapshots
       WHERE id = ?`,
      [snapshotId],
    )
    const row = result.values?.[0] as PricingSnapshotRow | undefined
    return row ? toPricingSnapshot(row) : null
  }

  async linkBookingFolio(input: BookingFolioLinkInput): Promise<BookingFolioLinkRecord> {
    const db = await this.getConnection()
    const now = nowIso()
    const existing = await db.query(
      'SELECT id FROM booking_folio_links WHERE reservation_id = ? AND account_id = ? LIMIT 1',
      [input.reservationId, input.accountId],
    )
    const id = String(existing.values?.[0]?.id ?? input.id ?? createEntityId('booking-folio-link'))
    if (existing.values?.[0]) {
      await db.run('UPDATE booking_folio_links SET status = ?, updated_at = ? WHERE id = ?', [
        input.status,
        input.updatedAt ?? now,
        id,
      ])
    } else {
      await db.run(
        `INSERT INTO booking_folio_links
         (id, reservation_id, account_id, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.reservationId,
          input.accountId,
          input.status,
          input.createdAt ?? now,
          input.updatedAt ?? now,
        ],
      )
    }
    const result = await db.query(
      'SELECT id, reservation_id, account_id, status, created_at, updated_at FROM booking_folio_links WHERE id = ?',
      [id],
    )
    return toBookingFolioLink(result.values?.[0] as BookingFolioLinkRow)
  }

  async linkBookingRegistryEvent(
    input: BookingRegistryEventLinkInput,
  ): Promise<BookingRegistryEventLinkRecord> {
    const db = await this.getConnection()
    const id = input.id ?? createEntityId('booking-registry-link')
    await db.run(
      `INSERT INTO booking_registry_event_links
       (id, reservation_id, request_id, registry_event_id, event_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.reservationId ?? null,
        input.requestId ?? null,
        input.registryEventId,
        input.eventType,
        input.createdAt ?? nowIso(),
      ],
    )
    const result = await db.query(
      `SELECT id, reservation_id, request_id, registry_event_id, event_type, created_at
       FROM booking_registry_event_links
       WHERE id = ?`,
      [id],
    )
    return toBookingRegistryEventLink(result.values?.[0] as BookingRegistryEventLinkRow)
  }

  async seedInitialTariffsIfMissing(): Promise<void> {
    const db = await this.getConnection()
    const result = await db.query('SELECT COUNT(*) AS count FROM tariff_rules WHERE active = 1')
    const count = Number(result.values?.[0]?.count ?? 0)

    for (const rule of initialTariffRules) {
      if (count > 0) {
        const existing = await db.query(
          'SELECT id FROM tariff_rules WHERE active = 1 AND LOWER(name) = LOWER(?) LIMIT 1',
          [rule.name],
        )
        if (existing.values?.[0]?.id) continue
      }
      await this.createTariffRule(rule)
    }
  }

  async getActiveTariffRules(): Promise<TariffRule[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, name, item_type, row_label, reservation_type, amount_cents, currency, season_year,
        valid_from, valid_to, priority, active, notes, created_at, updated_at
       FROM tariff_rules
       WHERE active = 1
       ORDER BY reservation_type, item_type, priority, row_label`,
    )
    return (result.values ?? []).map((row) => toTariffRule(row as TariffRuleRow))
  }

  async getTariffRule(tariffRuleId: string): Promise<TariffRule | null> {
    const db = await this.getConnection()
    return this.getTariffRuleById(db, tariffRuleId)
  }

  async createTariffRule(input: TariffRuleInput): Promise<TariffRule> {
    const db = await this.getConnection()
    const now = nowIso()
    const id = createEntityId('tariff')
    await db.run(
      `INSERT INTO tariff_rules
       (id, name, item_type, row_label, reservation_type, amount_cents, currency, season_year,
        valid_from, valid_to, priority, active, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'EUR', ?, ?, ?, ?, 1, ?, ?, ?)`,
      [
        id,
        input.name.trim(),
        input.itemType,
        input.rowLabel?.trim() || null,
        input.reservationType,
        Math.max(0, input.amountCents),
        input.seasonYear ?? null,
        input.validFrom ?? null,
        input.validTo ?? null,
        input.priority ?? 100,
        input.notes?.trim() || null,
        now,
        now,
      ],
    )
    return this.requireTariffRule(db, id)
  }

  async updateTariffRule(tariffRuleId: string, input: TariffRuleInput): Promise<TariffRule> {
    const db = await this.getConnection()
    await db.run(
      `UPDATE tariff_rules
       SET name = ?, item_type = ?, row_label = ?, reservation_type = ?, amount_cents = ?,
        season_year = ?, valid_from = ?, valid_to = ?, priority = ?, notes = ?, updated_at = ?
       WHERE id = ? AND active = 1`,
      [
        input.name.trim(),
        input.itemType,
        input.rowLabel?.trim() || null,
        input.reservationType,
        Math.max(0, input.amountCents),
        input.seasonYear ?? null,
        input.validFrom ?? null,
        input.validTo ?? null,
        input.priority ?? 100,
        input.notes?.trim() || null,
        nowIso(),
        tariffRuleId,
      ],
    )
    return this.requireTariffRule(db, tariffRuleId)
  }

  async deactivateTariffRule(tariffRuleId: string): Promise<void> {
    const db = await this.getConnection()
    await db.run('UPDATE tariff_rules SET active = 0, updated_at = ? WHERE id = ?', [
      nowIso(),
      tariffRuleId,
    ])
  }

  async suggestPriceForItem(
    item: BeachItem,
    reservationType: TariffReservationType,
    date = getTodayIsoDate(),
  ): Promise<PriceSuggestion> {
    const rules = (await this.getActiveTariffRules()).filter((rule) => {
      const validFromOk = !rule.validFrom || rule.validFrom <= date
      const validToOk = !rule.validTo || date <= rule.validTo
      return (
        rule.itemType === item.type &&
        rule.reservationType === reservationType &&
        validFromOk &&
        validToOk
      )
    })

    const exact = rules
      .filter((rule) => rule.rowLabel === item.rowLabel)
      .toSorted((a, b) => a.priority - b.priority)[0]
    if (exact) {
      return {
        tariffRule: exact,
        amountCents: exact.amountCents,
        reason: exact.name,
        confidence: 'exact',
      }
    }

    const fallback = rules
      .filter((rule) => !rule.rowLabel)
      .toSorted((a, b) => a.priority - b.priority)[0]
    if (fallback) {
      return {
        tariffRule: fallback,
        amountCents: fallback.amountCents,
        reason: fallback.name,
        confidence: 'fallback',
      }
    }

    return {
      tariffRule: null,
      amountCents: 0,
      reason: 'Nessuna tariffa trovata',
      confidence: 'none',
    }
  }

  async seedInitialExtraItemsIfMissing(): Promise<void> {
    const db = await this.getConnection()
    const result = await db.query('SELECT COUNT(*) AS count FROM extra_item_catalog WHERE active = 1')
    if (Number(result.values?.[0]?.count ?? 0) > 0) {
      return
    }
    const entries: ExtraItemCatalogInput[] = [
      { name: 'Lettino', category: 'Relax', defaultAmountCents: 800, maxQuantityPerBooking: 2, includedQuantityDefault: 0, sortOrder: 10 },
      { name: 'Sdraio', category: 'Relax', defaultAmountCents: 500, maxQuantityPerBooking: 2, includedQuantityDefault: 0, sortOrder: 20 },
      { name: 'Sedia', category: 'Sedute', defaultAmountCents: 300, maxQuantityPerBooking: 4, includedQuantityDefault: 0, sortOrder: 30 },
      { name: 'Poltroncina', category: 'Sedute', defaultAmountCents: 400, maxQuantityPerBooking: 2, includedQuantityDefault: 0, sortOrder: 40 },
    ]
    for (const entry of entries) {
      await this.createExtraItemCatalogEntry(entry)
    }
  }

  async getActiveExtraItemCatalog(): Promise<ExtraItemCatalogEntry[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, name, category, unit_label, default_amount_cents, max_quantity_per_booking,
        included_quantity_default, active, sort_order, notes, created_at, updated_at
       FROM extra_item_catalog
       WHERE active = 1
       ORDER BY sort_order, name`,
    )
    return (result.values ?? []).map((row) => toExtraCatalogEntry(row as ExtraItemCatalogRow))
  }

  async createExtraItemCatalogEntry(input: ExtraItemCatalogInput): Promise<ExtraItemCatalogEntry> {
    const db = await this.getConnection()
    const now = nowIso()
    const id = createEntityId('extra-catalog')
    await db.run(
      `INSERT INTO extra_item_catalog
       (id, name, category, unit_label, default_amount_cents, max_quantity_per_booking,
        included_quantity_default, active, sort_order, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
      [
        id,
        input.name.trim(),
        input.category?.trim() || null,
        input.unitLabel?.trim() || 'pz',
        Math.max(0, input.defaultAmountCents ?? 0),
        Math.max(1, input.maxQuantityPerBooking ?? 99),
        Math.max(0, input.includedQuantityDefault ?? 0),
        input.sortOrder ?? 100,
        input.notes?.trim() || null,
        now,
        now,
      ],
    )
    const entry = (await this.getActiveExtraItemCatalog()).find((item) => item.id === id)
    if (!entry) throw new Error('Extra non trovato dopo il salvataggio.')
    return entry
  }

  async updateExtraItemCatalogEntry(
    id: string,
    input: ExtraItemCatalogInput,
  ): Promise<ExtraItemCatalogEntry> {
    const db = await this.getConnection()
    await db.run(
      `UPDATE extra_item_catalog
       SET name = ?, category = ?, unit_label = ?, default_amount_cents = ?, max_quantity_per_booking = ?,
        included_quantity_default = ?, sort_order = ?, notes = ?, updated_at = ?
       WHERE id = ? AND active = 1`,
      [
        input.name.trim(),
        input.category?.trim() || null,
        input.unitLabel?.trim() || 'pz',
        Math.max(0, input.defaultAmountCents ?? 0),
        Math.max(1, input.maxQuantityPerBooking ?? 99),
        Math.max(0, input.includedQuantityDefault ?? 0),
        input.sortOrder ?? 100,
        input.notes?.trim() || null,
        nowIso(),
        id,
      ],
    )
    const entry = (await this.getActiveExtraItemCatalog()).find((item) => item.id === id)
    if (!entry) throw new Error('Extra non trovato.')
    return entry
  }

  async deactivateExtraItemCatalogEntry(id: string): Promise<void> {
    const db = await this.getConnection()
    await db.run('UPDATE extra_item_catalog SET active = 0, updated_at = ? WHERE id = ?', [
      nowIso(),
      id,
    ])
  }

  async addExtraItemToAccount(accountId: string, input: AccountExtraItemInput): Promise<AccountExtraItem> {
    const db = await this.getConnection()
    const now = nowIso()
    const id = createEntityId('account-extra')
    const quantity = Math.max(1, input.quantity)
    const unitAmountCents = Math.max(0, input.unitAmountCents)
    await db.run(
      `INSERT INTO account_extra_items
       (id, account_id, catalog_item_id, name, quantity, unit_amount_cents, total_amount_cents,
        notes, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        id,
        accountId,
        input.catalogItemId ?? null,
        input.name.trim(),
        quantity,
        unitAmountCents,
        quantity * unitAmountCents,
        input.notes?.trim() || null,
        now,
        now,
      ],
    )
    await this.recalculateAccountTotalWithExtras(accountId)
    return (await this.getExtraItemsForAccount(accountId)).find((item) => item.id === id)!
  }

  async updateAccountExtraItem(id: string, input: AccountExtraItemInput): Promise<AccountExtraItem> {
    const db = await this.getConnection()
    const currentResult = await db.query('SELECT account_id FROM account_extra_items WHERE id = ?', [id])
    const accountId = String(currentResult.values?.[0]?.account_id ?? '')
    if (!accountId) throw new Error('Extra conto non trovato.')
    const quantity = Math.max(1, input.quantity)
    const unitAmountCents = Math.max(0, input.unitAmountCents)
    await db.run(
      `UPDATE account_extra_items
       SET catalog_item_id = ?, name = ?, quantity = ?, unit_amount_cents = ?,
        total_amount_cents = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      [
        input.catalogItemId ?? null,
        input.name.trim(),
        quantity,
        unitAmountCents,
        quantity * unitAmountCents,
        input.notes?.trim() || null,
        nowIso(),
        id,
      ],
    )
    await this.recalculateAccountTotalWithExtras(accountId)
    return (await this.getExtraItemsForAccount(accountId)).find((item) => item.id === id)!
  }

  async removeAccountExtraItem(id: string): Promise<void> {
    const db = await this.getConnection()
    const currentResult = await db.query('SELECT account_id FROM account_extra_items WHERE id = ?', [id])
    const accountId = String(currentResult.values?.[0]?.account_id ?? '')
    await db.run('UPDATE account_extra_items SET active = 0, updated_at = ? WHERE id = ?', [
      nowIso(),
      id,
    ])
    if (accountId) await this.recalculateAccountTotalWithExtras(accountId)
  }

  async getExtraItemsForAccount(accountId: string): Promise<AccountExtraItem[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, account_id, catalog_item_id, name, quantity, unit_amount_cents,
        total_amount_cents, notes, active, created_at, updated_at
       FROM account_extra_items
       WHERE account_id = ? AND active = 1
       ORDER BY created_at`,
      [accountId],
    )
    return (result.values ?? []).map((row) => toAccountExtraItem(row as AccountExtraItemRow))
  }

  async seedInitialIncludedItemsIfMissing(): Promise<void> {
    const db = await this.getConnection()
    const result = await db.query('SELECT COUNT(*) AS count FROM tariff_included_items WHERE active = 1')
    if (Number(result.values?.[0]?.count ?? 0) > 0) {
      return
    }

    const ensureCatalogId = async (name: string, sortOrder: number): Promise<string> => {
      const found = await db.query(
        'SELECT id FROM extra_item_catalog WHERE LOWER(name) = LOWER(?) AND active = 1 LIMIT 1',
        [name],
      )
      const existingId = found.values?.[0]?.id
      if (existingId) return String(existingId)
      return (await this.createExtraItemCatalogEntry({ name, sortOrder })).id
    }

    const catalogIds = {
      Lettino: await ensureCatalogId('Lettino', 10),
      Sdraio: await ensureCatalogId('Sdraio', 20),
      Poltroncina: await ensureCatalogId('Poltroncina', 40),
    }
    const now = nowIso()
    const rows = [
      { itemType: 'palm', name: 'Lettino', quantity: 2, catalogItemId: catalogIds.Lettino },
      { itemType: 'palm', name: 'Sdraio', quantity: 1, catalogItemId: catalogIds.Sdraio },
      { itemType: 'palm', name: 'Poltroncina', quantity: 1, catalogItemId: catalogIds.Poltroncina },
      { itemType: 'small_palm', name: 'Lettino', quantity: 2, catalogItemId: catalogIds.Lettino },
      { itemType: 'small_palm', name: 'Sdraio', quantity: 1, catalogItemId: catalogIds.Sdraio },
      { itemType: 'small_palm', name: 'Poltroncina', quantity: 1, catalogItemId: catalogIds.Poltroncina },
      { itemType: 'umbrella', name: 'Lettino', quantity: 1, catalogItemId: catalogIds.Lettino },
      { itemType: 'umbrella', name: 'Sdraio', quantity: 1, catalogItemId: catalogIds.Sdraio },
    ]

    for (const row of rows) {
      await db.run(
        `INSERT INTO tariff_included_items
         (id, tariff_rule_id, item_type, row_label, reservation_type, catalog_item_id, name,
          quantity, included, active, created_at, updated_at)
         VALUES (?, NULL, ?, NULL, 'seasonal', ?, ?, ?, 1, 1, ?, ?)`,
        [
          createEntityId('included'),
          row.itemType,
          row.catalogItemId,
          row.name,
          row.quantity,
          now,
          now,
        ],
      )
    }
  }

  async getIncludedItemsForTariffContext(
    itemType: string,
    rowLabel: string | null,
    reservationType: string,
  ): Promise<TariffIncludedItem[]> {
    const db = await this.getConnection()
    const result = await db.query(
      `SELECT id, tariff_rule_id, item_type, row_label, reservation_type, catalog_item_id,
        name, quantity, included, active, created_at, updated_at
       FROM tariff_included_items
       WHERE active = 1
        AND included = 1
        AND item_type = ?
        AND reservation_type = ?
        AND (row_label IS NULL OR row_label = ?)
       ORDER BY CASE WHEN row_label IS NULL THEN 1 ELSE 0 END, name`,
      [itemType, reservationType, rowLabel],
    )
    return (result.values ?? []).map((row) => toTariffIncludedItem(row as TariffIncludedItemRow))
  }

  async createOrUpdatePaymentSchedule(input: PaymentScheduleInput): Promise<PaymentSchedule> {
    const db = await this.getConnection()
    const now = nowIso()
    const existing = await db.query(
      `SELECT id, account_id, schedule_type, total_installments, active, notes, created_at, updated_at
       FROM payment_schedules
       WHERE account_id = ? AND active = 1
       LIMIT 1`,
      [input.accountId],
    )
    const existingRow = existing.values?.[0] as PaymentScheduleRow | undefined
    if (existingRow) {
      await db.run(
        `UPDATE payment_schedules
         SET schedule_type = ?, total_installments = ?, notes = ?, updated_at = ?
         WHERE id = ?`,
        [
          input.scheduleType ?? existingRow.schedule_type,
          Math.max(1, input.totalInstallments ?? existingRow.total_installments),
          input.notes?.trim() || existingRow.notes,
          now,
          existingRow.id,
        ],
      )
      const updated = await db.query(
        `SELECT id, account_id, schedule_type, total_installments, active, notes, created_at, updated_at
         FROM payment_schedules WHERE id = ?`,
        [existingRow.id],
      )
      return toPaymentSchedule(updated.values?.[0] as PaymentScheduleRow)
    }

    const id = createEntityId('schedule')
    await db.run(
      `INSERT INTO payment_schedules
       (id, account_id, schedule_type, total_installments, active, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?)`,
      [
        id,
        input.accountId,
        input.scheduleType ?? 'manual',
        Math.max(1, input.totalInstallments ?? 1),
        input.notes?.trim() || null,
        now,
        now,
      ],
    )
    const created = await db.query(
      `SELECT id, account_id, schedule_type, total_installments, active, notes, created_at, updated_at
       FROM payment_schedules WHERE id = ?`,
      [id],
    )
    return toPaymentSchedule(created.values?.[0] as PaymentScheduleRow)
  }

  async resetSeedForDevelopmentOnly(): Promise<void> {
    const db = await this.getConnection()
    await db.execute(`
      DELETE FROM reservations;
      DELETE FROM payments;
      DELETE FROM account_extra_items;
      DELETE FROM beach_item_status_events;
      DELETE FROM accounts;
      DELETE FROM extra_item_catalog;
      DELETE FROM tariff_rules;
      DELETE FROM beach_item_customer_assignments;
      DELETE FROM customers;
      DELETE FROM beach_items;
      DELETE FROM layout_versions;
      DELETE FROM beach_layouts;
      DELETE FROM app_meta;
    `)
    await this.seedIfNeeded(db)
    await this.seedInitialTariffsIfMissing()
    await this.seedInitialExtraItemsIfMissing()
    await this.seedInitialIncludedItemsIfMissing()
  }

  async resetBrowserDatabaseForDevelopmentOnly(): Promise<void> {
    if (this.runtime !== 'web-persistent-sqlite') {
      throw new Error('Reset database browser disponibile solo in sviluppo web.')
    }

    const db = await this.getConnection()
    await db.close()
    await db.delete()
    this.connection = null
    await this.initialize()
  }

  private async getAccountById(
    db: SQLiteDBConnection,
    accountId: string,
  ): Promise<Account | null> {
    const result = await db.query(
      `SELECT id, item_id, customer_id, assignment_id, account_type, season_label,
        base_amount_cents, extras_amount_cents, total_amount_cents, paid_amount_cents, balance_amount_cents, status, notes, active,
        opened_at, closed_at, created_at, updated_at
       FROM accounts
       WHERE id = ?
       LIMIT 1`,
      [accountId],
    )
    const row = result.values?.[0] as AccountRow | undefined
    return row ? toAccount(row) : null
  }

  private async requireAccount(db: SQLiteDBConnection, accountId: string): Promise<Account> {
    const account = await this.getAccountById(db, accountId)
    if (!account) {
      throw new Error('Conto non trovato.')
    }
    return account
  }

  private async getReservationById(
    db: SQLiteDBConnection,
    reservationId: string,
  ): Promise<Reservation | null> {
    const result = await db.query(
      `SELECT id, item_id, customer_id, assignment_id, account_id, reservation_type, start_date,
        end_date, status, title, notes, active, created_at, updated_at, cancelled_at
       FROM reservations
       WHERE id = ?
       LIMIT 1`,
      [reservationId],
    )
    const row = result.values?.[0] as ReservationRow | undefined
    return row ? toReservation(row) : null
  }

  private async requireReservation(
    db: SQLiteDBConnection,
    reservationId: string,
  ): Promise<Reservation> {
    const reservation = await this.getReservationById(db, reservationId)
    if (!reservation) {
      throw new Error('Prenotazione non trovata.')
    }
    return reservation
  }

  private validateReservationInput(input: ReservationInput): void {
    if (!input.itemId || !input.customerId || !isDateRangeValid(input.startDate, input.endDate)) {
      throw new Error('Periodo non valido')
    }
  }

  private requireBookingRequest(
    requests: BookingRequestRecord[],
    requestId: string,
  ): BookingRequestRecord {
    const request = requests.find((current) => current.id === requestId)
    if (!request) {
      throw new Error('Richiesta prenotazione non trovata.')
    }
    return request
  }

  private requireBookingStatusEvent(
    events: BookingStatusEventRecord[],
    eventId: string,
  ): BookingStatusEventRecord {
    const event = events.find((current) => current.id === eventId)
    if (!event) {
      throw new Error('Evento prenotazione non trovato.')
    }
    return event
  }

  private requireBookingConflict(
    conflicts: BookingConflictRecord[],
    conflictId: string,
  ): BookingConflictRecord {
    const conflict = conflicts.find((current) => current.id === conflictId)
    if (!conflict) {
      throw new Error('Conflitto prenotazione non trovato.')
    }
    return conflict
  }

  private requireAvailabilityLock(
    locks: AvailabilityLockRecord[],
    lockId: string,
  ): AvailabilityLockRecord {
    const lock = locks.find((current) => current.id === lockId)
    if (!lock) {
      throw new Error('Blocco disponibilita non trovato.')
    }
    return lock
  }

  private async getRequiredPricingSnapshot(snapshotId: string): Promise<PricingSnapshotRecord> {
    const snapshot = await this.getPricingSnapshotById(snapshotId)
    if (!snapshot) {
      throw new Error('Snapshot prezzo non trovato.')
    }
    return snapshot
  }

  private async getTariffRuleById(
    db: SQLiteDBConnection,
    tariffRuleId: string,
  ): Promise<TariffRule | null> {
    const result = await db.query(
      `SELECT id, name, item_type, row_label, reservation_type, amount_cents, currency, season_year,
        valid_from, valid_to, priority, active, notes, created_at, updated_at
       FROM tariff_rules
       WHERE id = ?
       LIMIT 1`,
      [tariffRuleId],
    )
    const row = result.values?.[0] as TariffRuleRow | undefined
    return row ? toTariffRule(row) : null
  }

  private async requireTariffRule(
    db: SQLiteDBConnection,
    tariffRuleId: string,
  ): Promise<TariffRule> {
    const rule = await this.getTariffRuleById(db, tariffRuleId)
    if (!rule) {
      throw new Error('Tariffa non trovata.')
    }
    return rule
  }

  private async getBeachItemStatus(
    db: SQLiteDBConnection,
    itemId: string,
  ): Promise<BeachItemStatus | null> {
    const result = await db.query('SELECT status FROM beach_items WHERE id = ?', [itemId])
    return (result.values?.[0]?.status as BeachItemStatus | undefined) ?? null
  }

  private async getConnection(): Promise<SQLiteDBConnection> {
    if (this.connection) {
      return this.connection
    }

    const sqlite = new SQLiteConnection(CapacitorSQLite)
    this.sqlite = sqlite

    if (this.runtime === 'web-persistent-sqlite' && !this.webStoreInitialized) {
      await this.waitForJeepSqliteElement()
      await sqlite.initWebStore()
      this.webStoreInitialized = true
      this.registerPagehideFlush()
    }

    const existing = await sqlite.isConnection(DATABASE_NAME, false)
    const db = existing.result
      ? await sqlite.retrieveConnection(DATABASE_NAME, false)
      : await sqlite.createConnection(DATABASE_NAME, false, 'no-encryption', SCHEMA_VERSION, false)

    await db.open()
    this.connection = this.runtime === 'web-persistent-sqlite' ? this.withWebPersistence(db) : db
    return this.connection
  }

  private withWebPersistence(db: SQLiteDBConnection): SQLiteDBConnection {
    const persist = async () => {
      await this.persistWebStore()
    }
    const originalRun = db.run.bind(db)
    const originalExecute = db.execute.bind(db)
    const originalExecuteSet = db.executeSet.bind(db)

    db.run = async (...args: Parameters<SQLiteDBConnection['run']>) => {
      const result = await originalRun(...args)
      await persist()
      return result
    }
    db.execute = async (...args: Parameters<SQLiteDBConnection['execute']>) => {
      const result = await originalExecute(...args)
      await persist()
      return result
    }
    db.executeSet = async (...args: Parameters<SQLiteDBConnection['executeSet']>) => {
      const result = await originalExecuteSet(...args)
      await persist()
      return result
    }

    return db
  }

  private async persistWebStore(): Promise<void> {
    if (this.runtime !== 'web-persistent-sqlite' || !this.sqlite) {
      return
    }

    await this.sqlite.saveToStore(SQLITE_STORE_NAME)
  }

  private async waitForJeepSqliteElement(): Promise<void> {
    if (typeof document === 'undefined' || typeof customElements === 'undefined') {
      return
    }

    await customElements.whenDefined('jeep-sqlite')
    const element = document.querySelector('jeep-sqlite') as JeepSqliteElement | null
    if (!element) {
      throw new Error('Elemento jeep-sqlite non presente nel DOM.')
    }

    await element.componentOnReady?.()
  }

  private registerPagehideFlush(): void {
    if (this.pagehideFlushRegistered || typeof window === 'undefined') {
      return
    }

    this.pagehideFlushRegistered = true
    window.addEventListener('pagehide', () => {
      this.persistWebStore().catch((error) => {
        console.warn('Salvataggio SQLite web su pagehide non riuscito.', error)
      })
    })
  }

  private async seedIfNeeded(db: SQLiteDBConnection): Promise<void> {
    const now = nowIso()

    await db.run(
      `INSERT OR REPLACE INTO app_meta (key, value, updated_at)
       VALUES ('schema_version', ?, ?), ('beach_width_m', ?, ?), ('beach_depth_m', ?, ?), ('initial_seed_version', ?, ?)`,
      [
        String(SCHEMA_VERSION),
        now,
        String(defaultBeachLayout.widthM),
        now,
        String(defaultBeachLayout.depthM),
        now,
        String(INITIAL_SEED_VERSION),
        now,
      ],
    )

    await db.run(
      `INSERT OR IGNORE INTO beach_layouts
       (id, name, width_m, depth_m, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        defaultBeachLayout.id,
        defaultBeachLayout.name,
        defaultBeachLayout.widthM,
        defaultBeachLayout.depthM,
        1,
        now,
        now,
      ],
    )

    await db.run(
      `INSERT OR IGNORE INTO layout_versions
       (id, layout_id, version, description, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        initialLayoutVersion.id,
        initialLayoutVersion.layoutId,
        initialLayoutVersion.version,
        initialLayoutVersion.description,
        now,
      ],
    )

    const countResult = await db.query('SELECT COUNT(*) AS count FROM beach_items WHERE layout_id = ?', [
      defaultBeachLayout.id,
    ])
    const count = Number(countResult.values?.[0]?.count ?? 0)

    if (count > 0) {
      return
    }

    const seedSet = createInitialBeachSeed().map((item) => ({
      statement: `INSERT INTO beach_items
        (id, layout_id, code, type, row_label, row_index, number_index, x_m, y_m,
          width_m, height_m, rotation_deg, status, active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [
        item.id,
        item.layoutId,
        item.code,
        item.type,
        item.rowLabel,
        item.rowIndex,
        item.numberIndex,
        item.xM,
        item.yM,
        item.widthM,
        item.heightM,
        item.rotationDeg,
        item.status,
        item.active ? 1 : 0,
        now,
        now,
      ],
    }))

    await db.executeSet(seedSet)
  }

  private async ensureRuntimeColumns(db: SQLiteDBConnection): Promise<void> {
    const tableInfo = await db.query('PRAGMA table_info(beach_items)')
    const columns = getPragmaTableColumnNames(tableInfo.values)

    if (!columns.has('operational_note')) {
      await db.execute('ALTER TABLE beach_items ADD COLUMN operational_note TEXT;')
    }

    if (!columns.has('status_updated_at')) {
      await db.execute('ALTER TABLE beach_items ADD COLUMN status_updated_at TEXT;')
    }

    if (!columns.has('usage_type')) {
      await db.execute("ALTER TABLE beach_items ADD COLUMN usage_type TEXT NOT NULL DEFAULT 'daily';")
    }

    const accountInfo = await db.query('PRAGMA table_info(accounts)')
    const accountColumns = getPragmaTableColumnNames(accountInfo.values)

    if (!accountColumns.has('base_amount_cents')) {
      await db.execute('ALTER TABLE accounts ADD COLUMN base_amount_cents INTEGER NOT NULL DEFAULT 0;')
      await db.execute('UPDATE accounts SET base_amount_cents = total_amount_cents WHERE base_amount_cents = 0;')
    }

    if (!accountColumns.has('extras_amount_cents')) {
      await db.execute('ALTER TABLE accounts ADD COLUMN extras_amount_cents INTEGER NOT NULL DEFAULT 0;')
    }

    const extraCatalogInfo = await db.query('PRAGMA table_info(extra_item_catalog)')
    const extraCatalogColumns = getPragmaTableColumnNames(extraCatalogInfo.values)
    const addExtraCatalogColumn = async (name: string, definition: string) => {
      if (!extraCatalogColumns.has(name)) {
        await db.execute(`ALTER TABLE extra_item_catalog ADD COLUMN ${name} ${definition};`)
      }
    }
    await addExtraCatalogColumn('category', 'TEXT')
    await addExtraCatalogColumn('max_quantity_per_booking', 'INTEGER NOT NULL DEFAULT 99')
    await addExtraCatalogColumn('included_quantity_default', 'INTEGER NOT NULL DEFAULT 0')

    const layoutVersionsInfo = await db.query('PRAGMA table_info(beach_layout_versions)')
    const layoutVersionColumns = getPragmaTableColumnNames(layoutVersionsInfo.values)
    const addLayoutVersionColumn = async (name: string, definition: string) => {
      if (!layoutVersionColumns.has(name)) {
        await db.execute(`ALTER TABLE beach_layout_versions ADD COLUMN ${name} ${definition};`)
      }
    }
    await addLayoutVersionColumn('margin_top_m', 'REAL DEFAULT 0.5')
    await addLayoutVersionColumn('margin_right_m', 'REAL DEFAULT 0.5')
    await addLayoutVersionColumn('margin_bottom_m', 'REAL DEFAULT 0.5')
    await addLayoutVersionColumn('margin_left_m', 'REAL DEFAULT 0.5')

    const layoutRowsInfo = await db.query('PRAGMA table_info(beach_layout_rows)')
    const layoutRowColumns = getPragmaTableColumnNames(layoutRowsInfo.values)
    const addLayoutRowColumn = async (name: string, definition: string) => {
      if (!layoutRowColumns.has(name)) {
        await db.execute(`ALTER TABLE beach_layout_rows ADD COLUMN ${name} ${definition};`)
      }
    }
    await addLayoutRowColumn('zone_id', 'TEXT')
    await addLayoutRowColumn('asset_variant_id', 'TEXT')
    await addLayoutRowColumn('start_margin_m', 'REAL DEFAULT 0')
    await addLayoutRowColumn('end_margin_m', 'REAL DEFAULT 0')
    await addLayoutRowColumn('distribution_axis', "TEXT DEFAULT 'x'")

    const reservationInfo = await db.query('PRAGMA table_info(reservations)')
    const reservationColumns = getPragmaTableColumnNames(reservationInfo.values)
    const addReservationColumn = async (name: string, definition: string) => {
      if (!reservationColumns.has(name)) {
        await db.execute(`ALTER TABLE reservations ADD COLUMN ${name} ${definition};`)
      }
    }
    await addReservationColumn('source', "TEXT NOT NULL DEFAULT 'operator'")
    await addReservationColumn('booking_mode', "TEXT NOT NULL DEFAULT 'operator_app'")
    await addReservationColumn('booking_status', "TEXT NOT NULL DEFAULT 'active'")
    await addReservationColumn('period_type', "TEXT NOT NULL DEFAULT 'daily'")
    await addReservationColumn('sync_state', "TEXT NOT NULL DEFAULT 'local'")
    await addReservationColumn('remote_id', 'TEXT')
    await addReservationColumn('version', 'INTEGER NOT NULL DEFAULT 1')
    await addReservationColumn('deleted_at', 'TEXT')
    await addReservationColumn('pricing_snapshot_id', 'TEXT')
    await addReservationColumn('folio_id', 'TEXT')
    await addReservationColumn('request_id', 'TEXT')
    await db.execute(`
      UPDATE reservations
      SET booking_status = status,
          period_type = reservation_type,
          folio_id = account_id
      WHERE booking_status IS NULL
         OR booking_status = ''
         OR (booking_status = 'active' AND status != 'active')
         OR period_type IS NULL
         OR period_type = ''
         OR (period_type = 'daily' AND reservation_type != 'daily')
         OR (folio_id IS NULL AND account_id IS NOT NULL);
    `)

    const bookingRequestInfo = await db.query('PRAGMA table_info(booking_requests)')
    const bookingRequestColumns = getPragmaTableColumnNames(bookingRequestInfo.values)
    const addBookingRequestColumn = async (name: string, definition: string) => {
      if (!bookingRequestColumns.has(name)) {
        await db.execute(`ALTER TABLE booking_requests ADD COLUMN ${name} ${definition};`)
      }
    }
    await addBookingRequestColumn('matched_customer_id', 'TEXT')
    await addBookingRequestColumn('pairing_decision_json', 'TEXT')
    await addBookingRequestColumn('pairing_resolved_at', 'TEXT')
    await db.execute(`
      CREATE TABLE IF NOT EXISTS booking_customer_pairing_candidates (
        id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        existing_customer_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        confidence TEXT NOT NULL,
        reasons_json TEXT NOT NULL,
        matched_fields_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(request_id) REFERENCES booking_requests(id),
        FOREIGN KEY(existing_customer_id) REFERENCES customers(id)
      );
    `)
  }
}

class BrowserMemoryAdapter implements BeachDatabaseAdapter {
  runtime = 'browser-memory-fallback' as const
  private layout = defaultBeachLayout
  private items: BeachItem[] = []
  private statusEvents: BeachItemStatusEvent[] = []
  private customers: Customer[] = []
  private assignments: BeachItemCustomerAssignment[] = []
  private accounts: Account[] = []
  private payments: Payment[] = []
  private reservations: Reservation[] = []
  private bookingRequests: BookingRequestRecord[] = []
  private pairingCandidates: BookingCustomerPairingCandidateRecord[] = []
  private bookingStatusEvents: BookingStatusEventRecord[] = []
  private bookingConflicts: BookingConflictRecord[] = []
  private availabilityLocks: AvailabilityLockRecord[] = []
  private pricingSnapshots: PricingSnapshotRecord[] = []
  private bookingFolioLinks: BookingFolioLinkRecord[] = []
  private bookingRegistryEventLinks: BookingRegistryEventLinkRecord[] = []
  private tariffRules: TariffRule[] = []
  private extraCatalog: ExtraItemCatalogEntry[] = []
  private accountExtras: AccountExtraItem[] = []
  private includedItems: TariffIncludedItem[] = []
  private paymentSchedules: PaymentSchedule[] = []
  private activeParametricLayout: ParametricLayoutBundle | null = null
  private draftParametricLayout: ParametricLayoutBundle | null = null

  async initialize(): Promise<void> {
    if (this.items.length === 0) {
      this.items = createInitialBeachSeed()
    }
    await this.seedInitialTariffsIfMissing()
    await this.seedInitialExtraItemsIfMissing()
    await this.seedInitialIncludedItemsIfMissing()
  }

  async getDatabaseDiagnostics(): Promise<DatabaseDiagnostics> {
    const tables = await this.listDatabaseTables()
    return {
      runtime: this.runtime,
      databaseName: DATABASE_NAME,
      schemaVersion: SCHEMA_VERSION,
      tables,
      totalVisibleRows: tables.reduce((sum, table) => sum + table.rowCount, 0),
      refreshedAt: nowIso(),
    }
  }

  async listDatabaseTables(): Promise<DatabaseTableSummary[]> {
    return DATABASE_TABLES.map((table) => ({
      ...table,
      rowCount: this.getMemoryTableRows(table.name).length,
    }))
  }

  async getTableRowCount(tableName: string): Promise<number> {
    requireKnownDatabaseTable(tableName)
    return this.getMemoryTableRows(tableName).length
  }

  async readTableRows(
    tableName: string,
    options: DatabaseTableReadOptions = {},
  ): Promise<DatabaseTableRows> {
    const table = requireKnownDatabaseTable(tableName)
    const limit = normalizeTableLimit(options.limit)
    const offset = normalizeTableOffset(options.offset)
    const rows = this.getMemoryTableRows(tableName)
    return {
      tableName,
      category: table.category,
      rowCount: rows.length,
      limit,
      offset,
      rows: rows.slice(offset, offset + limit),
      refreshedAt: nowIso(),
    }
  }

  async getActiveLayout(): Promise<BeachLayout> {
    return this.layout
  }

  async getBeachItems(layoutId: string): Promise<BeachItem[]> {
    const items = this.items.filter((item) => item.layoutId === layoutId && item.active)
    const assignedCustomers = await this.getAssignedCustomersForItems(items.map((item) => item.id))
    const assignedByItemId = new Map(assignedCustomers.map((assigned) => [assigned.itemId, assigned]))
    const accounts = await this.getActiveAccountsForItems(items.map((item) => item.id))
    const accountByItemId = new Map(accounts.map((account) => [account.itemId, account]))
    const reservations = await this.getCurrentReservationsForItems(items.map((item) => item.id))
    const reservationByItemId = new Map(
      reservations.map((reservation) => [reservation.itemId, reservation]),
    )
    return items.map((item) => ({
      ...item,
      assignedCustomer: assignedByItemId.get(item.id) ?? null,
      activeAccount: accountByItemId.get(item.id) ?? null,
      currentReservation: reservationByItemId.get(item.id) ?? null,
    }))
  }

  async updateBeachItemStatus(itemId: string, status: BeachItemStatus): Promise<void> {
    const current = this.items.find((item) => item.id === itemId)

    if (!current || current.status === status) {
      return
    }

    const now = nowIso()
    this.items = this.items.map((item) =>
      item.id === itemId ? { ...item, status, statusUpdatedAt: now } : item,
    )
    this.statusEvents = [
      {
        id: createEventId(itemId, now),
        itemId,
        previousStatus: current.status,
        nextStatus: status,
        note: '',
        createdAt: now,
      },
      ...this.statusEvents,
    ]
    this.persistState()
  }

  async updateBeachItemUsageType(itemId: string, usageType: BeachItemUsageType): Promise<void> {
    this.items = this.items.map((item) =>
      item.id === itemId ? { ...item, usageType } : item,
    )
    this.persistState()
  }

  async updateBeachItemOperationalNote(itemId: string, note: string): Promise<void> {
    this.items = this.items.map((item) =>
      item.id === itemId ? { ...item, operationalNote: note.trim() } : item,
    )
    this.persistState()
  }

  async getBeachItemStatusEvents(itemId: string): Promise<BeachItemStatusEvent[]> {
    return this.statusEvents.filter((event) => event.itemId === itemId).slice(0, 3)
  }

  async getBeachStatusSummary(layoutId: string): Promise<BeachStatusSummary> {
    return createSummary(await this.getBeachItems(layoutId))
  }

  async ensureParametricLayoutImported(): Promise<void> {
    if (this.activeParametricLayout) return

    const metricModel = createDefaultBeachMetricModel()
    const now = nowIso()
    const versionId = `layout-version-imported-${this.layout.id}`
    const items = this.items.filter((item) => item.layoutId === this.layout.id && item.active)
    const rowsByLabel = new Map<string, BeachItem[]>()

    for (const item of items) {
      const rowItems = rowsByLabel.get(item.rowLabel) ?? []
      rowItems.push(item)
      rowsByLabel.set(item.rowLabel, rowItems)
    }

    this.activeParametricLayout = {
      version: {
        id: versionId,
        name: `${this.layout.name} · layout parametrico`,
        status: 'active',
        source: 'imported_legacy',
        beachWidthM: this.layout.widthM,
        beachDepthM: this.layout.depthM,
        seaSide: metricModel.beach.seaSide,
        createdAt: now,
        updatedAt: now,
        activatedAt: now,
      },
      elements: items.map((item) => ({
        id: `${versionId}-element-${item.id}`,
        layoutVersionId: versionId,
        legacyBeachItemId: item.id,
        code: item.code,
        family: item.type,
        rowLabel: item.rowLabel,
        numberIndex: item.numberIndex,
        xM: item.xM,
        yM: item.yM,
        widthM: item.widthM,
        heightM: item.heightM,
        diameterM: item.widthM === item.heightM ? item.widthM : null,
        rotationDeg: item.rotationDeg,
        zoneId: item.type === 'umbrella' ? 'umbrellas' : item.type === 'small_palm' ? 'small-palms' : 'palms',
        locked: true,
        active: item.active,
        zIndex: item.rowIndex * 100 + item.numberIndex,
      })),
      rows: [...rowsByLabel.entries()].map(([rowLabel, rowItems]) => ({
        id: `${versionId}-row-${rowLabel}`,
        layoutVersionId: versionId,
        rowLabel,
        family: rowItems[0].type,
        itemCount: rowItems.length,
        yM: rowItems.reduce((sum, item) => sum + item.yM, 0) / rowItems.length,
        minGapM: null,
        distributionMode: 'imported_locked',
        locked: true,
      })),
      zones: metricModel.zones.map((zone) => ({
        id: `${versionId}-zone-${zone.id}`,
        layoutVersionId: versionId,
        type: zone.type,
        label: zone.label,
        xM: zone.xM,
        yM: zone.yM,
        widthM: zone.widthM,
        heightM: zone.heightM,
        locked: zone.locked,
        visible: zone.visible,
      })),
      distanceRules: {
        id: `${versionId}-distance-rules`,
        layoutVersionId: versionId,
        minPalmGapM: metricModel.distances.minPalmGapM,
        minUmbrellaGapM: metricModel.distances.minUmbrellaGapM,
        minSmallPalmGapM: metricModel.distances.minSmallPalmGapM,
        minMixedAssetGapM: metricModel.distances.minMixedAssetGapM,
        minPalmRowGapM: metricModel.distances.minPalmRowGapM,
        minUmbrellaRowGapM: metricModel.distances.minUmbrellaRowGapM,
        minZoneGapM: metricModel.distances.minZoneGapM,
        marginFromBoundaryM: metricModel.distances.marginFromBoundaryM,
        marginFromSeaM: metricModel.distances.marginFromSeaM,
        marginFromEntranceM: metricModel.distances.marginFromEntranceM,
      },
    }
  }

  async getActiveParametricLayoutBundle(): Promise<ParametricLayoutBundle | null> {
    await this.ensureParametricLayoutImported()
    return this.activeParametricLayout
  }

  async getDraftParametricLayoutBundle(): Promise<ParametricLayoutBundle | null> {
    return this.draftParametricLayout
  }

  async getParametricLayoutBundle(versionId: string): Promise<ParametricLayoutBundle | null> {
    return [this.activeParametricLayout, this.draftParametricLayout]
      .filter((bundle): bundle is ParametricLayoutBundle => Boolean(bundle))
      .find((bundle) => bundle.version.id === versionId) ?? null
  }

  async getParametricLayoutVersions(): Promise<BeachLayoutVersion[]> {
    return [this.activeParametricLayout, this.draftParametricLayout]
      .filter((bundle): bundle is ParametricLayoutBundle => Boolean(bundle))
      .map((bundle) => bundle.version)
  }

  async deleteDraftParametricLayout(versionId: string): Promise<void> {
    if (this.draftParametricLayout?.version.id === versionId) {
      this.draftParametricLayout = null
      return
    }
    throw new Error('Bozza non trovata o non eliminabile.')
  }

  async activateDraftParametricLayout(versionId: string): Promise<void> {
    if (!this.draftParametricLayout || this.draftParametricLayout.version.id !== versionId) {
      throw new Error('La versione selezionata non è una bozza attivabile.')
    }
    if (!this.activeParametricLayout) await this.ensureParametricLayoutImported()
    const now = nowIso()
    if (this.activeParametricLayout) {
      this.activeParametricLayout = {
        ...this.activeParametricLayout,
        version: { ...this.activeParametricLayout.version, status: 'archived', updatedAt: now },
      }
    }
    this.activeParametricLayout = {
      ...this.draftParametricLayout,
      version: { ...this.draftParametricLayout.version, status: 'active', updatedAt: now, activatedAt: now },
    }
    this.draftParametricLayout = null
  }

  async restoreArchivedParametricLayout(versionId: string): Promise<ParametricLayoutBundle> {
    const archived = await this.getParametricLayoutBundle(versionId)
    if (!archived || archived.version.status !== 'archived') {
      throw new Error('Layout archiviato non trovato.')
    }
    this.draftParametricLayout = {
      ...archived,
      version: { ...archived.version, id: createEntityId('layout-restore'), status: 'draft', source: 'parametric_engine' },
    }
    return this.draftParametricLayout
  }

  async loadParametricSetupDraft(versionId: string): Promise<ParametricSetupState> {
    const bundle = await this.getParametricLayoutBundle(versionId)
    if (!bundle) throw new Error('Bozza parametrica non trovata.')
    const metricModel = createDefaultBeachMetricModel()
    const zones = bundle.zones.map((zone) => ({
      id: zone.id,
      label: zone.label,
      type: zone.type,
      xM: zone.xM,
      yM: zone.yM,
      widthM: zone.widthM,
      heightM: zone.heightM,
      locked: zone.locked,
      visible: zone.visible,
      allowedAssetFamilies: zone.type === 'palms' ? ['palm'] : zone.type === 'umbrellas' ? ['umbrella'] : zone.type === 'small_palms' ? ['small_palm'] : [],
    }))
    const zoneForFamily = (family: string) => zones.find((zone) => family === 'palm' ? zone.type === 'palms' : family === 'umbrella' ? zone.type === 'umbrellas' : zone.type === 'small_palms')?.id ?? zones[0]?.id ?? ''
    return {
      layoutVersionId: bundle.version.id,
      status: bundle.version.status === 'active' ? 'active_view' : 'draft_editing',
      beach: {
        name: bundle.version.name,
        widthM: bundle.version.beachWidthM,
        depthM: bundle.version.beachDepthM,
        seaSide: bundle.version.seaSide,
        marginsM: metricModel.beach.marginsM,
      },
      zones,
      rows: bundle.rows.map((row) => ({ id: row.id, label: row.rowLabel, family: row.family, zoneId: zoneForFamily(row.family), itemCount: row.itemCount, yM: row.yM, minGapM: row.minGapM, distributionMode: row.distributionMode, locked: row.locked, assetVariantId: null, startMarginM: 0, endMarginM: 0, distributionAxis: 'x' })),
      assetMetrics: assetMetricDefinitions.map((metric) => ({ ...metric, locked: true })),
      distanceRules: bundle.distanceRules ? { minPalmGapM: bundle.distanceRules.minPalmGapM, minUmbrellaGapM: bundle.distanceRules.minUmbrellaGapM, minSmallPalmGapM: bundle.distanceRules.minSmallPalmGapM, minMixedAssetGapM: bundle.distanceRules.minMixedAssetGapM, minPalmRowGapM: bundle.distanceRules.minPalmRowGapM, minUmbrellaRowGapM: bundle.distanceRules.minUmbrellaRowGapM, minZoneGapM: bundle.distanceRules.minZoneGapM, marginFromBoundaryM: bundle.distanceRules.marginFromBoundaryM, marginFromSeaM: bundle.distanceRules.marginFromSeaM, marginFromEntranceM: bundle.distanceRules.marginFromEntranceM } : metricModel.distances,
    }
  }

  async saveParametricSetupDraft(state: ParametricSetupState): Promise<void> {
    if (!this.draftParametricLayout || this.draftParametricLayout.version.id !== state.layoutVersionId) return
    this.draftParametricLayout = {
      ...this.draftParametricLayout,
      version: { ...this.draftParametricLayout.version, name: state.beach.name, beachWidthM: state.beach.widthM, beachDepthM: state.beach.depthM, seaSide: state.beach.seaSide, updatedAt: nowIso() },
      rows: state.rows.map((row) => ({ id: row.id, layoutVersionId: state.layoutVersionId, rowLabel: row.label, family: row.family, itemCount: row.itemCount, yM: row.yM, minGapM: row.minGapM, distributionMode: row.distributionMode, locked: row.locked })),
      zones: state.zones.map((zone) => ({ id: zone.id, layoutVersionId: state.layoutVersionId, type: zone.type, label: zone.label, xM: zone.xM, yM: zone.yM, widthM: zone.widthM, heightM: zone.heightM, locked: zone.locked, visible: zone.visible })),
      distanceRules: { id: `${state.layoutVersionId}-distance-rules`, layoutVersionId: state.layoutVersionId, ...state.distanceRules },
    }
  }

  async calculateAndSaveParametricDraft(state: ParametricSetupState): Promise<ParametricLayoutOutput> {
    await this.saveParametricSetupDraft(state)
    const existing = this.draftParametricLayout
    const output = calculateParametricLayout({ beach: state.beach, rows: state.rows.map((row) => ({ rowLabel: row.label, family: row.family, itemCount: row.itemCount, zoneId: row.zoneId, yM: row.yM ?? undefined })), zones: state.zones.map((zone) => ({ id: zone.id, type: zone.type, xM: zone.xM, yM: zone.yM, widthM: zone.widthM, heightM: zone.heightM })), assetMetrics: state.assetMetrics, distances: state.distanceRules })
    if (this.draftParametricLayout) {
      this.draftParametricLayout = { ...this.draftParametricLayout, elements: output.elements.map((element) => {
        const sourceElement = existing?.elements.find((candidate) => candidate.family === element.family && candidate.rowLabel === element.rowLabel && candidate.numberIndex === element.numberIndex)
        return { ...element, id: `${state.layoutVersionId}-element-${sourceElement?.legacyBeachItemId ?? `${element.rowLabel}-${element.numberIndex}`}`, layoutVersionId: state.layoutVersionId, legacyBeachItemId: sourceElement?.legacyBeachItemId ?? null, code: sourceElement?.code ?? element.code }
      }) }
    }
    return output
  }

  async createParametricDraftFromActive(): Promise<ParametricLayoutBundle> {
    if (this.draftParametricLayout) return this.draftParametricLayout
    await this.ensureParametricLayoutImported()

    if (!this.activeParametricLayout) {
      throw new Error('Layout parametrico attivo non disponibile.')
    }

    const now = nowIso()
    const draftVersionId = createEntityId('layout-draft')
    const active = this.activeParametricLayout
    const zoneByFamily = new Map([
      ['palm', active.zones.find((zone) => zone.type === 'palms')?.id],
      ['umbrella', active.zones.find((zone) => zone.type === 'umbrellas')?.id],
      ['small_palm', active.zones.find((zone) => zone.type === 'small_palms')?.id],
    ])
    const recalculated = calculateParametricLayout({
      beach: {
        widthM: active.version.beachWidthM,
        depthM: active.version.beachDepthM,
        seaSide: active.version.seaSide,
        marginsM: createDefaultBeachMetricModel().beach.marginsM,
      },
      rows: active.rows.map((row) => ({
        rowLabel: row.rowLabel,
        family: row.family,
        itemCount: row.itemCount,
        zoneId: zoneByFamily.get(row.family) ?? active.zones[0]?.id ?? '',
        yM: row.yM ?? undefined,
      })),
      zones: active.zones.map((zone) => ({
        id: zone.id,
        type: zone.type,
        xM: zone.xM,
        yM: zone.yM,
        widthM: zone.widthM,
        heightM: zone.heightM,
      })),
      distances: active.distanceRules
        ? {
            minPalmGapM: active.distanceRules.minPalmGapM,
            minUmbrellaGapM: active.distanceRules.minUmbrellaGapM,
            minSmallPalmGapM: active.distanceRules.minSmallPalmGapM,
            minMixedAssetGapM: active.distanceRules.minMixedAssetGapM,
            minPalmRowGapM: active.distanceRules.minPalmRowGapM,
            minUmbrellaRowGapM: active.distanceRules.minUmbrellaRowGapM,
            minZoneGapM: active.distanceRules.minZoneGapM,
            marginFromBoundaryM: active.distanceRules.marginFromBoundaryM,
          }
        : createDefaultBeachMetricModel().distances,
    })
    this.draftParametricLayout = {
      version: {
        ...active.version,
        id: draftVersionId,
        name: `${active.version.name} · bozza`,
        status: 'draft',
        source: 'parametric_engine',
        createdAt: now,
        updatedAt: now,
        activatedAt: null,
      },
      elements: recalculated.elements.map((element) => {
        const sourceElement = active.elements.find(
          (candidate) =>
            candidate.family === element.family &&
            candidate.rowLabel === element.rowLabel &&
            candidate.numberIndex === element.numberIndex,
        )
        return {
          ...element,
          id: `${draftVersionId}-element-${sourceElement?.legacyBeachItemId ?? `${element.rowLabel}-${element.numberIndex}`}`,
          layoutVersionId: draftVersionId,
          legacyBeachItemId: sourceElement?.legacyBeachItemId ?? null,
          code: sourceElement?.code ?? element.code,
          locked: false,
        }
      }),
      rows: active.rows.map((row) => ({
        ...row,
        id: `${draftVersionId}-row-${row.rowLabel}`,
        layoutVersionId: draftVersionId,
        distributionMode: 'uniform',
        locked: false,
      })),
      zones: active.zones.map((zone) => ({
        ...zone,
        id: `${draftVersionId}-zone-${zone.type}`,
        layoutVersionId: draftVersionId,
        locked: false,
      })),
      distanceRules: active.distanceRules
        ? {
            ...active.distanceRules,
            id: `${draftVersionId}-distance-rules`,
            layoutVersionId: draftVersionId,
          }
        : null,
    }
    return this.draftParametricLayout
  }

  async createCustomer(input: CustomerInput): Promise<Customer> {
    const fullName = input.fullName.trim()

    if (!fullName) {
      throw new Error('Nome cliente obbligatorio')
    }

    const now = nowIso()
    const customer: Customer = {
      id: createEntityId('customer'),
      fullName,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      notes: input.notes?.trim() || null,
      active: true,
      createdAt: now,
      updatedAt: now,
    }
    this.customers = [...this.customers, customer]
    this.persistState()
    return customer
  }

  async updateCustomer(customerId: string, input: CustomerInput): Promise<Customer> {
    const fullName = input.fullName.trim()

    if (!fullName) {
      throw new Error('Nome cliente obbligatorio')
    }

    let updated: Customer | null = null
    this.customers = this.customers.map((customer) => {
      if (customer.id !== customerId || !customer.active) {
        return customer
      }

      updated = {
        ...customer,
        fullName,
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null,
        notes: input.notes?.trim() || null,
        updatedAt: nowIso(),
      }
      return updated
    })

    if (!updated) {
      throw new Error('Cliente non trovato.')
    }

    this.persistState()
    return updated
  }

  async getCustomer(customerId: string): Promise<Customer | null> {
    return this.customers.find((customer) => customer.id === customerId && customer.active) ?? null
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const normalized = query.trim().toLowerCase()
    return this.customers
      .filter((customer) => {
        if (!customer.active) {
          return false
        }

        if (!normalized) {
          return true
        }

        return [customer.fullName, customer.phone ?? '', customer.email ?? '']
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      })
      .toSorted((a, b) => a.fullName.localeCompare(b.fullName))
      .slice(0, 50)
  }

  async getActiveCustomers(): Promise<Customer[]> {
    return this.searchCustomers('')
  }

  async assignCustomerToBeachItem(
    itemId: string,
    customerId: string,
    assignmentType: CustomerAssignmentType,
    note = '',
  ): Promise<void> {
    const now = nowIso()
    this.assignments = this.assignments.map((assignment) =>
      assignment.itemId === itemId && assignment.active
        ? { ...assignment, active: false, unassignedAt: now, updatedAt: now }
        : assignment,
    )
    this.assignments = [
      ...this.assignments,
      {
        id: createEntityId('assignment'),
        itemId,
        customerId,
        assignmentType,
        active: true,
        assignedAt: now,
        unassignedAt: null,
        note: note.trim() || null,
        createdAt: now,
        updatedAt: now,
      },
    ]

    const item = this.items.find((current) => current.id === itemId)
    if (item?.status === 'free') {
      await this.updateBeachItemStatus(itemId, 'occupied')
      return
    }

    this.persistState()
  }

  async unassignCustomerFromBeachItem(itemId: string): Promise<void> {
    const now = nowIso()
    this.assignments = this.assignments.map((assignment) =>
      assignment.itemId === itemId && assignment.active
        ? { ...assignment, active: false, unassignedAt: now, updatedAt: now }
        : assignment,
    )

    const item = this.items.find((current) => current.id === itemId)
    if (item?.status === 'occupied') {
      await this.updateBeachItemStatus(itemId, 'free')
      return
    }

    this.persistState()
  }

  async getAssignedCustomerForItem(itemId: string): Promise<BeachItemAssignedCustomer | null> {
    const assignments = await this.getAssignedCustomersForItems([itemId])
    return assignments[0] ?? null
  }

  async getAssignedCustomersForItems(itemIds: string[]): Promise<BeachItemAssignedCustomer[]> {
    const itemIdSet = new Set(itemIds)
    return this.assignments
      .filter((assignment) => assignment.active && itemIdSet.has(assignment.itemId))
      .map((assignment) => {
        const customer = this.customers.find(
          (current) => current.id === assignment.customerId && current.active,
        )
        return customer
          ? {
              itemId: assignment.itemId,
              customer,
              assignment,
            }
          : null
      })
      .filter((assignment): assignment is BeachItemAssignedCustomer => Boolean(assignment))
  }

  async getCustomerAssignments(customerId: string): Promise<BeachItemCustomerAssignment[]> {
    return this.assignments
      .filter((assignment) => assignment.customerId === customerId)
      .toSorted((a, b) => b.assignedAt.localeCompare(a.assignedAt))
  }

  async createAccountForAssignment(input: AccountInput): Promise<Account> {
    const now = nowIso()
    const totalAmountCents = Math.max(0, input.totalAmountCents)
    const account: Account = {
      id: createEntityId('account'),
      itemId: input.itemId,
      customerId: input.customerId,
      assignmentId: input.assignmentId ?? null,
      accountType: input.accountType,
      seasonLabel: input.seasonLabel?.trim() || null,
      baseAmountCents: totalAmountCents,
      extrasAmountCents: 0,
      totalAmountCents,
      paidAmountCents: 0,
      balanceAmountCents: totalAmountCents,
      status: calculateAccountStatus(totalAmountCents, 0),
      notes: input.notes?.trim() || null,
      active: true,
      openedAt: now,
      closedAt: null,
      createdAt: now,
      updatedAt: now,
    }
    this.accounts = [...this.accounts, account]
    this.persistState()
    return account
  }

  async getActiveAccountForItem(itemId: string): Promise<Account | null> {
    return (
      this.accounts
        .filter((account) => account.itemId === itemId && account.active)
        .toSorted((a, b) => b.openedAt.localeCompare(a.openedAt))[0] ?? null
    )
  }

  async getAccount(accountId: string): Promise<Account | null> {
    return this.accounts.find((account) => account.id === accountId) ?? null
  }

  async getActiveAccountsForItems(itemIds: string[]): Promise<Account[]> {
    const itemIdSet = new Set(itemIds)
    return this.accounts
      .filter((account) => account.active && itemIdSet.has(account.itemId))
      .toSorted((a, b) => b.openedAt.localeCompare(a.openedAt))
  }

  async getAccountsForCustomer(customerId: string): Promise<Account[]> {
    return this.accounts
      .filter((account) => account.customerId === customerId)
      .toSorted((a, b) => b.openedAt.localeCompare(a.openedAt))
  }

  async updateAccountTotal(accountId: string, totalAmountCents: number, notes?: string | null): Promise<Account> {
    const current = this.getRequiredMemoryAccount(accountId)
    const baseAmountCents = Math.max(0, totalAmountCents)
    const normalizedTotal = baseAmountCents + current.extrasAmountCents
    const balanceAmountCents = normalizedTotal - current.paidAmountCents
    const status = calculateAccountStatus(normalizedTotal, current.paidAmountCents, current.status)
    const updated = {
      ...current,
      baseAmountCents,
      totalAmountCents: normalizedTotal,
      balanceAmountCents,
      status,
      notes: notes?.trim() || current.notes,
      updatedAt: nowIso(),
    }
    this.accounts = this.accounts.map((account) => (account.id === accountId ? updated : account))
    this.persistState()
    return updated
  }

  async addPayment(
    accountId: string,
    amountCents: number,
    paymentMethod: PaymentMethod,
    note = '',
  ): Promise<Payment> {
    if (amountCents <= 0) {
      throw new Error('Importo non valido')
    }

    const now = nowIso()
    const payment: Payment = {
      id: createEntityId('payment'),
      accountId,
      amountCents,
      paymentMethod,
      paidAt: now,
      note: note.trim() || null,
      createdAt: now,
    }
    this.payments = [payment, ...this.payments]
    await this.recalculateAccountBalance(accountId)
    return payment
  }

  async getPaymentsForAccount(accountId: string): Promise<Payment[]> {
    return this.payments
      .filter((payment) => payment.accountId === accountId)
      .toSorted((a, b) => b.paidAt.localeCompare(a.paidAt))
  }

  async recalculateAccountBalance(accountId: string): Promise<Account> {
    const current = this.getRequiredMemoryAccount(accountId)
    const paidAmountCents = this.payments
      .filter((payment) => payment.accountId === accountId)
      .reduce((total, payment) => total + payment.amountCents, 0)
    const updated = {
      ...current,
      paidAmountCents,
      balanceAmountCents: current.totalAmountCents - paidAmountCents,
      status: calculateAccountStatus(current.totalAmountCents, paidAmountCents, current.status),
      updatedAt: nowIso(),
    }
    this.accounts = this.accounts.map((account) => (account.id === accountId ? updated : account))
    this.persistState()
    return updated
  }

  async recalculateAccountTotalWithExtras(accountId: string): Promise<Account> {
    const current = this.getRequiredMemoryAccount(accountId)
    const extrasAmountCents = this.accountExtras
      .filter((item) => item.accountId === accountId && item.active)
      .reduce((total, item) => total + item.totalAmountCents, 0)
    const totalAmountCents = current.baseAmountCents + extrasAmountCents
    const updated = {
      ...current,
      extrasAmountCents,
      totalAmountCents,
      balanceAmountCents: totalAmountCents - current.paidAmountCents,
      status: calculateAccountStatus(totalAmountCents, current.paidAmountCents, current.status),
      updatedAt: nowIso(),
    }
    this.accounts = this.accounts.map((account) => (account.id === accountId ? updated : account))
    this.persistState()
    return updated
  }

  async closeAccount(accountId: string): Promise<Account> {
    return this.deactivateMemoryAccount(accountId, this.getRequiredMemoryAccount(accountId).status)
  }

  async cancelAccount(accountId: string): Promise<Account> {
    return this.deactivateMemoryAccount(accountId, 'cancelled')
  }

  async createReservation(input: ReservationInput): Promise<Reservation> {
    this.validateMemoryReservationInput(input)
    if (!(await this.checkItemAvailability(input.itemId, input.startDate, input.endDate))) {
      throw new Error('Il posto è già prenotato in questo periodo.')
    }

    const now = nowIso()
    const reservation: Reservation = {
      id: createEntityId('reservation'),
      itemId: input.itemId,
      customerId: input.customerId,
      assignmentId: input.assignmentId ?? null,
      accountId: input.accountId ?? null,
      reservationType: input.reservationType,
      startDate: input.startDate,
      endDate: input.endDate,
      status: 'active',
      title: input.title?.trim() || null,
      notes: input.notes?.trim() || null,
      active: true,
      createdAt: now,
      updatedAt: now,
      cancelledAt: null,
    }
    this.reservations = [reservation, ...this.reservations]
    this.persistState()
    return reservation
  }

  async updateReservation(reservationId: string, input: ReservationInput): Promise<Reservation> {
    this.validateMemoryReservationInput(input)
    if (
      !(await this.checkItemAvailability(
        input.itemId,
        input.startDate,
        input.endDate,
        reservationId,
      ))
    ) {
      throw new Error('Il posto è già prenotato in questo periodo.')
    }

    const current = this.getRequiredMemoryReservation(reservationId)
    const updated: Reservation = {
      ...current,
      itemId: input.itemId,
      customerId: input.customerId,
      assignmentId: input.assignmentId ?? null,
      accountId: input.accountId ?? null,
      reservationType: input.reservationType,
      startDate: input.startDate,
      endDate: input.endDate,
      title: input.title?.trim() || null,
      notes: input.notes?.trim() || null,
      updatedAt: nowIso(),
    }
    this.reservations = this.reservations.map((reservation) =>
      reservation.id === reservationId ? updated : reservation,
    )
    this.persistState()
    return updated
  }

  async cancelReservation(reservationId: string): Promise<Reservation> {
    const current = this.getRequiredMemoryReservation(reservationId)
    const updated: Reservation = {
      ...current,
      active: false,
      status: 'cancelled',
      cancelledAt: nowIso(),
      updatedAt: nowIso(),
    }
    this.reservations = this.reservations.map((reservation) =>
      reservation.id === reservationId ? updated : reservation,
    )
    this.persistState()
    return updated
  }

  async getReservation(reservationId: string): Promise<Reservation | null> {
    return this.reservations.find((reservation) => reservation.id === reservationId) ?? null
  }

  async getReservationsForItem(itemId: string): Promise<Reservation[]> {
    return this.reservations
      .filter((reservation) => reservation.itemId === itemId)
      .toSorted((a, b) => b.startDate.localeCompare(a.startDate))
  }

  async getActiveReservationsForItem(itemId: string): Promise<Reservation[]> {
    return (await this.getReservationsForItem(itemId)).filter((reservation) =>
      this.isBlockingReservation(reservation),
    )
  }

  async getReservationsForCustomer(customerId: string): Promise<Reservation[]> {
    return this.reservations
      .filter((reservation) => reservation.customerId === customerId)
      .toSorted((a, b) => b.startDate.localeCompare(a.startDate))
  }

  async getReservationsByDateRange(startDate: string, endDate: string): Promise<Reservation[]> {
    return this.reservations
      .filter(
        (reservation) =>
          this.isBlockingReservation(reservation) &&
          doDateRangesOverlap(reservation.startDate, reservation.endDate, startDate, endDate),
      )
      .toSorted((a, b) => a.startDate.localeCompare(b.startDate))
  }

  async checkItemAvailability(
    itemId: string,
    startDate: string,
    endDate: string,
    excludeReservationId?: string,
  ): Promise<boolean> {
    return !this.reservations.some(
      (reservation) =>
        reservation.itemId === itemId &&
        reservation.id !== excludeReservationId &&
        this.isBlockingReservation(reservation) &&
        doDateRangesOverlap(reservation.startDate, reservation.endDate, startDate, endDate),
    )
  }

  async getCurrentReservationForItem(
    itemId: string,
    date = getTodayIsoDate(),
  ): Promise<Reservation | null> {
    const reservations = await this.getCurrentReservationsForItems([itemId], date)
    return reservations[0] ?? null
  }

  async getCurrentReservationsForItems(
    itemIds: string[],
    date = getTodayIsoDate(),
  ): Promise<Reservation[]> {
    const itemIdSet = new Set(itemIds)
    return this.reservations
      .filter(
        (reservation) =>
          itemIdSet.has(reservation.itemId) &&
          this.isBlockingReservation(reservation) &&
          reservation.startDate <= date &&
          date <= reservation.endDate,
      )
      .toSorted((a, b) => a.startDate.localeCompare(b.startDate))
  }

  async getUpcomingReservationsForItem(itemId: string, limit = 3): Promise<Reservation[]> {
    const today = getTodayIsoDate()
    return this.reservations
      .filter(
        (reservation) =>
          reservation.itemId === itemId &&
          this.isBlockingReservation(reservation) &&
          reservation.startDate >= today,
      )
      .toSorted((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, limit)
  }

  async listBookingRequests(): Promise<BookingRequestRecord[]> {
    return this.bookingRequests
      .filter((request) => !request.deletedAt)
      .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async createBookingRequest(input: BookingRequestInput): Promise<BookingRequestRecord> {
    const now = nowIso()
    const request: BookingRequestRecord = {
      id: input.id ?? createEntityId('booking-request'),
      workspaceId: input.workspaceId ?? null,
      source: input.source,
      status: input.status ?? 'new',
      pairingStatus: input.pairingStatus ?? 'unpaired',
      matchedCustomerId: null,
      pairingDecision: null,
      pairingResolvedAt: null,
      customerPayload: input.customerPayload,
      requestedPeriod: input.requestedPeriod,
      requestedItemId: input.requestedItemId ?? null,
      requestedItemType: input.requestedItemType ?? null,
      requestedExtras: input.requestedExtras ?? [],
      convertedReservationId: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      syncState: 'local',
      remoteId: null,
      version: 1,
    }
    this.bookingRequests = [request, ...this.bookingRequests]
    this.persistState()
    return request
  }

  async getBookingRequestById(requestId: string): Promise<BookingRequestRecord | null> {
    return this.bookingRequests.find((request) => request.id === requestId && !request.deletedAt) ?? null
  }

  async updateBookingRequestStatus(
    requestId: string,
    status: BookingRequestStatus,
  ): Promise<BookingRequestRecord> {
    const current = this.getRequiredMemoryBookingRequest(requestId)
    const updated = { ...current, status, updatedAt: nowIso(), version: current.version + 1 }
    this.bookingRequests = this.bookingRequests.map((request) =>
      request.id === requestId ? updated : request,
    )
    this.persistState()
    return updated
  }

  async listPairingCandidates(
    requestId: string,
  ): Promise<BookingCustomerPairingCandidateRecord[]> {
    return this.pairingCandidates
      .filter((candidate) => candidate.requestId === requestId)
      .toSorted((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt))
  }

  async replacePairingCandidates(
    requestId: string,
    candidates: BookingCustomerPairingCandidateRecord[],
  ): Promise<BookingCustomerPairingCandidateRecord[]> {
    this.pairingCandidates = [
      ...this.pairingCandidates.filter((candidate) => candidate.requestId !== requestId),
      ...candidates,
    ]
    this.persistState()
    return this.listPairingCandidates(requestId)
  }

  async updateBookingRequestPairingStatus(
    requestId: string,
    pairingStatus: BookingCustomerPairingStatus,
  ): Promise<BookingRequestRecord> {
    const current = this.getRequiredMemoryBookingRequest(requestId)
    const updated = { ...current, pairingStatus, updatedAt: nowIso(), version: current.version + 1 }
    this.bookingRequests = this.bookingRequests.map((request) =>
      request.id === requestId ? updated : request,
    )
    this.persistState()
    return updated
  }

  async resolveBookingRequestPairing(
    decision: BookingCustomerPairingDecision,
  ): Promise<BookingRequestRecord> {
    const current = this.getRequiredMemoryBookingRequest(decision.requestId)
    const decidedAt = decision.decidedAt ?? nowIso()
    const pairingStatus: BookingCustomerPairingStatus =
      decision.decision === 'match_existing'
        ? 'matched_existing'
        : decision.decision === 'create_new'
          ? 'manually_resolved'
          : decision.decision === 'reject'
            ? 'rejected'
            : 'unpaired'
    const updated: BookingRequestRecord = {
      ...current,
      status: decision.decision === 'reject' ? 'rejected' : current.status,
      pairingStatus,
      matchedCustomerId:
        decision.decision === 'match_existing' || decision.decision === 'create_new'
          ? decision.existingCustomerId ?? null
          : null,
      pairingDecision: { ...decision, decidedAt },
      pairingResolvedAt: decidedAt,
      updatedAt: nowIso(),
      version: current.version + 1,
    }
    this.bookingRequests = this.bookingRequests.map((request) =>
      request.id === decision.requestId ? updated : request,
    )
    this.persistState()
    return updated
  }

  async listBookingStatusEvents(filters: {
    reservationId?: string
    requestId?: string
  } = {}): Promise<BookingStatusEventRecord[]> {
    return this.bookingStatusEvents
      .filter((event) =>
        (!filters.reservationId || event.reservationId === filters.reservationId) &&
        (!filters.requestId || event.requestId === filters.requestId),
      )
      .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async appendBookingStatusEvent(input: BookingStatusEventInput): Promise<BookingStatusEventRecord> {
    const event: BookingStatusEventRecord = {
      id: input.id ?? createEntityId('booking-status-event'),
      reservationId: input.reservationId ?? null,
      requestId: input.requestId ?? null,
      fromStatus: input.fromStatus ?? null,
      toStatus: input.toStatus,
      source: input.source,
      reason: input.reason ?? null,
      payload: input.payload ?? null,
      createdAt: input.createdAt ?? nowIso(),
      createdBy: input.createdBy ?? null,
      deviceId: input.deviceId ?? null,
    }
    this.bookingStatusEvents = [event, ...this.bookingStatusEvents]
    this.persistState()
    return event
  }

  async listBookingConflicts(filters: {
    reservationId?: string
    requestId?: string
    status?: BookingConflictRecord['status']
  } = {}): Promise<BookingConflictRecord[]> {
    return this.bookingConflicts
      .filter((conflict) =>
        (!filters.reservationId || conflict.reservationId === filters.reservationId) &&
        (!filters.requestId || conflict.requestId === filters.requestId) &&
        (!filters.status || conflict.status === filters.status),
      )
      .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async createBookingConflict(input: BookingConflictInput): Promise<BookingConflictRecord> {
    const conflict: BookingConflictRecord = {
      id: input.id ?? createEntityId('booking-conflict'),
      reservationId: input.reservationId ?? null,
      requestId: input.requestId ?? null,
      conflictType: input.conflictType,
      severity: input.severity,
      affectedItemIds: input.affectedItemIds,
      affectedPeriod: input.affectedPeriod,
      message: input.message,
      status: input.status ?? 'open',
      createdAt: input.createdAt ?? nowIso(),
      resolvedAt: null,
    }
    this.bookingConflicts = [conflict, ...this.bookingConflicts]
    this.persistState()
    return conflict
  }

  async resolveBookingConflict(conflictId: string): Promise<BookingConflictRecord> {
    const current = this.getRequiredMemoryBookingConflict(conflictId)
    const updated = { ...current, status: 'resolved' as const, resolvedAt: nowIso() }
    this.bookingConflicts = this.bookingConflicts.map((conflict) =>
      conflict.id === conflictId ? updated : conflict,
    )
    this.persistState()
    return updated
  }

  async listAvailabilityLocks(filters: {
    itemId?: string
    status?: AvailabilityLockRecord['status']
  } = {}): Promise<AvailabilityLockRecord[]> {
    return this.availabilityLocks
      .filter((lock) =>
        (!filters.itemId || lock.itemId === filters.itemId) &&
        (!filters.status || lock.status === filters.status),
      )
      .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async createAvailabilityLock(input: AvailabilityLockInput): Promise<AvailabilityLockRecord> {
    const now = nowIso()
    const lock: AvailabilityLockRecord = {
      id: input.id ?? createEntityId('availability-lock'),
      workspaceId: input.workspaceId ?? null,
      itemId: input.itemId,
      period: input.period,
      source: input.source,
      reservationId: input.reservationId ?? null,
      requestId: input.requestId ?? null,
      status: input.status ?? 'active',
      expiresAt: input.expiresAt ?? null,
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
    }
    this.availabilityLocks = [lock, ...this.availabilityLocks]
    this.persistState()
    return lock
  }

  async releaseAvailabilityLock(lockId: string): Promise<AvailabilityLockRecord> {
    const current = this.getRequiredMemoryAvailabilityLock(lockId)
    const updated = { ...current, status: 'released' as const, updatedAt: nowIso() }
    this.availabilityLocks = this.availabilityLocks.map((lock) =>
      lock.id === lockId ? updated : lock,
    )
    this.persistState()
    return updated
  }

  async createPricingSnapshot(input: PricingSnapshotInput): Promise<PricingSnapshotRecord> {
    const now = nowIso()
    const snapshot: PricingSnapshotRecord = {
      id: input.id ?? createEntityId('pricing-snapshot'),
      reservationId: input.reservationId ?? null,
      sourceRuleId: input.sourceRuleId ?? null,
      catalogItemId: input.catalogItemId ?? null,
      periodType: input.periodType,
      scope: input.scope ?? null,
      basePrice: input.basePrice,
      extrasTotal: input.extrasTotal,
      includedItems: input.includedItems,
      calculatedTotal: input.calculatedTotal,
      manualOverride: input.manualOverride ?? null,
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
    }
    this.pricingSnapshots = [snapshot, ...this.pricingSnapshots]
    this.persistState()
    return snapshot
  }

  async getPricingSnapshotById(snapshotId: string): Promise<PricingSnapshotRecord | null> {
    return this.pricingSnapshots.find((snapshot) => snapshot.id === snapshotId) ?? null
  }

  async linkBookingFolio(input: BookingFolioLinkInput): Promise<BookingFolioLinkRecord> {
    const now = nowIso()
    const current = this.bookingFolioLinks.find(
      (link) => link.reservationId === input.reservationId && link.accountId === input.accountId,
    )
    const link: BookingFolioLinkRecord = {
      id: current?.id ?? input.id ?? createEntityId('booking-folio-link'),
      reservationId: input.reservationId,
      accountId: input.accountId,
      status: input.status,
      createdAt: current?.createdAt ?? input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
    }
    this.bookingFolioLinks = current
      ? this.bookingFolioLinks.map((existing) => (existing.id === link.id ? link : existing))
      : [link, ...this.bookingFolioLinks]
    this.persistState()
    return link
  }

  async linkBookingRegistryEvent(
    input: BookingRegistryEventLinkInput,
  ): Promise<BookingRegistryEventLinkRecord> {
    const link: BookingRegistryEventLinkRecord = {
      id: input.id ?? createEntityId('booking-registry-link'),
      reservationId: input.reservationId ?? null,
      requestId: input.requestId ?? null,
      registryEventId: input.registryEventId,
      eventType: input.eventType,
      createdAt: input.createdAt ?? nowIso(),
    }
    this.bookingRegistryEventLinks = [link, ...this.bookingRegistryEventLinks]
    this.persistState()
    return link
  }

  async seedInitialTariffsIfMissing(): Promise<void> {
    const now = nowIso()
    const existingNames = new Set(this.tariffRules.filter((rule) => rule.active).map((rule) => rule.name.toLowerCase()))
    const missingRules = initialTariffRules.filter((rule) => !existingNames.has(rule.name.toLowerCase()))
    if (missingRules.length === 0) return
    this.tariffRules = [...this.tariffRules, ...missingRules.map((rule) => ({
      id: createEntityId('tariff'),
      name: rule.name,
      itemType: rule.itemType,
      rowLabel: rule.rowLabel ?? null,
      reservationType: rule.reservationType,
      amountCents: rule.amountCents,
      currency: 'EUR' as const,
      seasonYear: rule.seasonYear ?? null,
      validFrom: rule.validFrom ?? null,
      validTo: rule.validTo ?? null,
      priority: rule.priority ?? 100,
      active: true,
      notes: rule.notes ?? null,
      createdAt: now,
      updatedAt: now,
    }))]
    this.persistState()
  }

  async getActiveTariffRules(): Promise<TariffRule[]> {
    return this.tariffRules
      .filter((rule) => rule.active)
      .toSorted((a, b) => a.reservationType.localeCompare(b.reservationType) || a.priority - b.priority)
  }

  async getTariffRule(tariffRuleId: string): Promise<TariffRule | null> {
    return this.tariffRules.find((rule) => rule.id === tariffRuleId) ?? null
  }

  async createTariffRule(input: TariffRuleInput): Promise<TariffRule> {
    const now = nowIso()
    const rule: TariffRule = {
      id: createEntityId('tariff'),
      name: input.name.trim(),
      itemType: input.itemType,
      rowLabel: input.rowLabel?.trim() || null,
      reservationType: input.reservationType,
      amountCents: Math.max(0, input.amountCents),
      currency: 'EUR',
      seasonYear: input.seasonYear ?? null,
      validFrom: input.validFrom ?? null,
      validTo: input.validTo ?? null,
      priority: input.priority ?? 100,
      active: true,
      notes: input.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    }
    this.tariffRules = [...this.tariffRules, rule]
    this.persistState()
    return rule
  }

  async updateTariffRule(tariffRuleId: string, input: TariffRuleInput): Promise<TariffRule> {
    let updated: TariffRule | null = null
    this.tariffRules = this.tariffRules.map((rule) => {
      if (rule.id !== tariffRuleId || !rule.active) {
        return rule
      }

      updated = {
        ...rule,
        name: input.name.trim(),
        itemType: input.itemType,
        rowLabel: input.rowLabel?.trim() || null,
        reservationType: input.reservationType,
        amountCents: Math.max(0, input.amountCents),
        seasonYear: input.seasonYear ?? null,
        validFrom: input.validFrom ?? null,
        validTo: input.validTo ?? null,
        priority: input.priority ?? 100,
        notes: input.notes?.trim() || null,
        updatedAt: nowIso(),
      }
      return updated
    })

    if (!updated) {
      throw new Error('Tariffa non trovata.')
    }

    this.persistState()
    return updated
  }

  async deactivateTariffRule(tariffRuleId: string): Promise<void> {
    this.tariffRules = this.tariffRules.map((rule) =>
      rule.id === tariffRuleId ? { ...rule, active: false, updatedAt: nowIso() } : rule,
    )
    this.persistState()
  }

  async suggestPriceForItem(
    item: BeachItem,
    reservationType: TariffReservationType,
    date = getTodayIsoDate(),
  ): Promise<PriceSuggestion> {
    const rules = (await this.getActiveTariffRules()).filter((rule) => {
      const validFromOk = !rule.validFrom || rule.validFrom <= date
      const validToOk = !rule.validTo || date <= rule.validTo
      return (
        rule.itemType === item.type &&
        rule.reservationType === reservationType &&
        validFromOk &&
        validToOk
      )
    })
    const exact = rules
      .filter((rule) => rule.rowLabel === item.rowLabel)
      .toSorted((a, b) => a.priority - b.priority)[0]
    if (exact) {
      return { tariffRule: exact, amountCents: exact.amountCents, reason: exact.name, confidence: 'exact' }
    }
    const fallback = rules
      .filter((rule) => !rule.rowLabel)
      .toSorted((a, b) => a.priority - b.priority)[0]
    if (fallback) {
      return {
        tariffRule: fallback,
        amountCents: fallback.amountCents,
        reason: fallback.name,
        confidence: 'fallback',
      }
    }
    return { tariffRule: null, amountCents: 0, reason: 'Nessuna tariffa trovata', confidence: 'none' }
  }

  async seedInitialExtraItemsIfMissing(): Promise<void> {
    if (this.extraCatalog.some((item) => item.active)) return
    const now = nowIso()
    const defaults: ExtraItemCatalogInput[] = [
      { name: 'Lettino', category: 'Relax', defaultAmountCents: 800, maxQuantityPerBooking: 2, includedQuantityDefault: 0, sortOrder: 10 },
      { name: 'Sdraio', category: 'Relax', defaultAmountCents: 500, maxQuantityPerBooking: 2, includedQuantityDefault: 0, sortOrder: 20 },
      { name: 'Sedia', category: 'Sedute', defaultAmountCents: 300, maxQuantityPerBooking: 4, includedQuantityDefault: 0, sortOrder: 30 },
      { name: 'Poltroncina', category: 'Sedute', defaultAmountCents: 400, maxQuantityPerBooking: 2, includedQuantityDefault: 0, sortOrder: 40 },
    ]
    this.extraCatalog = defaults.map((entry) => ({
      id: createEntityId('extra-catalog'),
      name: entry.name,
      category: entry.category ?? null,
      unitLabel: entry.unitLabel ?? 'pz',
      defaultAmountCents: entry.defaultAmountCents ?? 0,
      maxQuantityPerBooking: entry.maxQuantityPerBooking ?? 99,
      includedQuantityDefault: entry.includedQuantityDefault ?? 0,
      active: true,
      sortOrder: entry.sortOrder ?? 100,
      notes: entry.notes ?? null,
      createdAt: now,
      updatedAt: now,
    }))
    this.persistState()
  }

  async getActiveExtraItemCatalog(): Promise<ExtraItemCatalogEntry[]> {
    return this.extraCatalog
      .filter((item) => item.active)
      .toSorted((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
  }

  async createExtraItemCatalogEntry(input: ExtraItemCatalogInput): Promise<ExtraItemCatalogEntry> {
    const now = nowIso()
    const entry: ExtraItemCatalogEntry = {
      id: createEntityId('extra-catalog'),
      name: input.name.trim(),
      category: input.category?.trim() || null,
      unitLabel: input.unitLabel?.trim() || 'pz',
      defaultAmountCents: Math.max(0, input.defaultAmountCents ?? 0),
      maxQuantityPerBooking: Math.max(1, input.maxQuantityPerBooking ?? 99),
      includedQuantityDefault: Math.max(0, input.includedQuantityDefault ?? 0),
      active: true,
      sortOrder: input.sortOrder ?? 100,
      notes: input.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    }
    this.extraCatalog = [...this.extraCatalog, entry]
    this.persistState()
    return entry
  }

  async updateExtraItemCatalogEntry(id: string, input: ExtraItemCatalogInput): Promise<ExtraItemCatalogEntry> {
    let updated: ExtraItemCatalogEntry | null = null
    this.extraCatalog = this.extraCatalog.map((entry) => {
      if (entry.id !== id || !entry.active) return entry
      updated = {
        ...entry,
        name: input.name.trim(),
        category: input.category?.trim() || null,
        unitLabel: input.unitLabel?.trim() || 'pz',
        defaultAmountCents: Math.max(0, input.defaultAmountCents ?? 0),
        maxQuantityPerBooking: Math.max(1, input.maxQuantityPerBooking ?? 99),
        includedQuantityDefault: Math.max(0, input.includedQuantityDefault ?? 0),
        sortOrder: input.sortOrder ?? 100,
        notes: input.notes?.trim() || null,
        updatedAt: nowIso(),
      }
      return updated
    })
    if (!updated) throw new Error('Extra non trovato.')
    this.persistState()
    return updated
  }

  async deactivateExtraItemCatalogEntry(id: string): Promise<void> {
    this.extraCatalog = this.extraCatalog.map((entry) =>
      entry.id === id ? { ...entry, active: false, updatedAt: nowIso() } : entry,
    )
    this.persistState()
  }

  async addExtraItemToAccount(accountId: string, input: AccountExtraItemInput): Promise<AccountExtraItem> {
    const now = nowIso()
    const quantity = Math.max(1, input.quantity)
    const unitAmountCents = Math.max(0, input.unitAmountCents)
    const item: AccountExtraItem = {
      id: createEntityId('account-extra'),
      accountId,
      catalogItemId: input.catalogItemId ?? null,
      name: input.name.trim(),
      quantity,
      unitAmountCents,
      totalAmountCents: quantity * unitAmountCents,
      notes: input.notes?.trim() || null,
      active: true,
      createdAt: now,
      updatedAt: now,
    }
    this.accountExtras = [...this.accountExtras, item]
    await this.recalculateAccountTotalWithExtras(accountId)
    return item
  }

  async updateAccountExtraItem(id: string, input: AccountExtraItemInput): Promise<AccountExtraItem> {
    let updated: AccountExtraItem | null = null
    let accountId: string | null = null
    this.accountExtras = this.accountExtras.map((item) => {
      if (item.id !== id || !item.active) return item
      accountId = item.accountId
      const quantity = Math.max(1, input.quantity)
      const unitAmountCents = Math.max(0, input.unitAmountCents)
      updated = {
        ...item,
        catalogItemId: input.catalogItemId ?? null,
        name: input.name.trim(),
        quantity,
        unitAmountCents,
        totalAmountCents: quantity * unitAmountCents,
        notes: input.notes?.trim() || null,
        updatedAt: nowIso(),
      }
      return updated
    })
    if (!updated || !accountId) throw new Error('Extra conto non trovato.')
    await this.recalculateAccountTotalWithExtras(accountId)
    return updated
  }

  async removeAccountExtraItem(id: string): Promise<void> {
    const current = this.accountExtras.find((item) => item.id === id)
    this.accountExtras = this.accountExtras.map((item) =>
      item.id === id ? { ...item, active: false, updatedAt: nowIso() } : item,
    )
    if (current) await this.recalculateAccountTotalWithExtras(current.accountId)
    this.persistState()
  }

  async getExtraItemsForAccount(accountId: string): Promise<AccountExtraItem[]> {
    return this.accountExtras
      .filter((item) => item.accountId === accountId && item.active)
      .toSorted((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  async seedInitialIncludedItemsIfMissing(): Promise<void> {
    if (this.includedItems.some((item) => item.active)) return
    const now = nowIso()
    const catalogByName = new Map(this.extraCatalog.map((item) => [item.name, item.id]))
    const rows = [
      { itemType: 'palm', name: 'Lettino', quantity: 2 },
      { itemType: 'palm', name: 'Sdraio', quantity: 1 },
      { itemType: 'palm', name: 'Poltroncina', quantity: 1 },
      { itemType: 'small_palm', name: 'Lettino', quantity: 2 },
      { itemType: 'small_palm', name: 'Sdraio', quantity: 1 },
      { itemType: 'small_palm', name: 'Poltroncina', quantity: 1 },
      { itemType: 'umbrella', name: 'Lettino', quantity: 1 },
      { itemType: 'umbrella', name: 'Sdraio', quantity: 1 },
    ]
    this.includedItems = rows.map((row) => ({
      id: createEntityId('included'),
      tariffRuleId: null,
      itemType: row.itemType,
      rowLabel: null,
      reservationType: 'seasonal',
      catalogItemId: catalogByName.get(row.name) ?? null,
      name: row.name,
      quantity: row.quantity,
      included: true,
      active: true,
      createdAt: now,
      updatedAt: now,
    }))
    this.persistState()
  }

  async getIncludedItemsForTariffContext(
    itemType: string,
    rowLabel: string | null,
    reservationType: string,
  ): Promise<TariffIncludedItem[]> {
    return this.includedItems
      .filter(
        (item) =>
          item.active &&
          item.included &&
          item.itemType === itemType &&
          item.reservationType === reservationType &&
          (!item.rowLabel || item.rowLabel === rowLabel),
      )
      .toSorted((a, b) => a.name.localeCompare(b.name))
  }

  async createOrUpdatePaymentSchedule(input: PaymentScheduleInput): Promise<PaymentSchedule> {
    const current = this.paymentSchedules.find(
      (schedule) => schedule.accountId === input.accountId && schedule.active,
    )
    const now = nowIso()
    if (current) {
      const updated = {
        ...current,
        scheduleType: input.scheduleType ?? current.scheduleType,
        totalInstallments: Math.max(1, input.totalInstallments ?? current.totalInstallments),
        notes: input.notes?.trim() || current.notes,
        updatedAt: now,
      }
      this.paymentSchedules = this.paymentSchedules.map((schedule) =>
        schedule.id === current.id ? updated : schedule,
      )
      this.persistState()
      return updated
    }
    const schedule: PaymentSchedule = {
      id: createEntityId('schedule'),
      accountId: input.accountId,
      scheduleType: input.scheduleType ?? 'manual',
      totalInstallments: Math.max(1, input.totalInstallments ?? 1),
      active: true,
      notes: input.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    }
    this.paymentSchedules = [...this.paymentSchedules, schedule]
    this.persistState()
    return schedule
  }

  async resetSeedForDevelopmentOnly(): Promise<void> {
    this.items = createInitialBeachSeed()
    this.statusEvents = []
    this.customers = []
    this.assignments = []
    this.accounts = []
    this.payments = []
    this.reservations = []
    this.bookingRequests = []
    this.pairingCandidates = []
    this.bookingStatusEvents = []
    this.bookingConflicts = []
    this.availabilityLocks = []
    this.pricingSnapshots = []
    this.bookingFolioLinks = []
    this.bookingRegistryEventLinks = []
    this.tariffRules = []
    this.extraCatalog = []
    this.accountExtras = []
    this.includedItems = []
    this.paymentSchedules = []
    await this.seedInitialTariffsIfMissing()
    await this.seedInitialExtraItemsIfMissing()
    await this.seedInitialIncludedItemsIfMissing()
  }

  private getRequiredMemoryAccount(accountId: string): Account {
    const account = this.accounts.find((current) => current.id === accountId)
    if (!account) {
      throw new Error('Conto non trovato.')
    }
    return account
  }

  private deactivateMemoryAccount(accountId: string, status: AccountStatus): Account {
    const current = this.getRequiredMemoryAccount(accountId)
    const updated = {
      ...current,
      active: false,
      status,
      closedAt: nowIso(),
      updatedAt: nowIso(),
    }
    this.accounts = this.accounts.map((account) => (account.id === accountId ? updated : account))
    this.persistState()
    return updated
  }

  private getRequiredMemoryReservation(reservationId: string): Reservation {
    const reservation = this.reservations.find((current) => current.id === reservationId)
    if (!reservation) {
      throw new Error('Prenotazione non trovata.')
    }
    return reservation
  }

  private getRequiredMemoryBookingRequest(requestId: string): BookingRequestRecord {
    const request = this.bookingRequests.find((current) => current.id === requestId)
    if (!request) {
      throw new Error('Richiesta prenotazione non trovata.')
    }
    return request
  }

  private getRequiredMemoryBookingConflict(conflictId: string): BookingConflictRecord {
    const conflict = this.bookingConflicts.find((current) => current.id === conflictId)
    if (!conflict) {
      throw new Error('Conflitto prenotazione non trovato.')
    }
    return conflict
  }

  private getRequiredMemoryAvailabilityLock(lockId: string): AvailabilityLockRecord {
    const lock = this.availabilityLocks.find((current) => current.id === lockId)
    if (!lock) {
      throw new Error('Blocco disponibilita non trovato.')
    }
    return lock
  }

  private getMemoryTableRows(tableName: string): Record<string, unknown>[] {
    requireKnownDatabaseTable(tableName)

    switch (tableName) {
      case 'app_meta':
        return [
          { key: 'schema_version', value: String(SCHEMA_VERSION), updated_at: nowIso() },
          { key: 'initial_seed_version', value: String(INITIAL_SEED_VERSION), updated_at: nowIso() },
        ]
      case 'beach_layouts':
        return toDiagnosticRows([this.layout])
      case 'layout_versions':
        return toDiagnosticRows([initialLayoutVersion])
      case 'beach_items':
        return toDiagnosticRows(this.items)
      case 'beach_item_status_events':
        return toDiagnosticRows(this.statusEvents)
      case 'beach_layout_versions':
        return toDiagnosticRows(
          [this.activeParametricLayout?.version, this.draftParametricLayout?.version].filter(
            (row) => Boolean(row),
          ) as BeachLayoutVersion[],
        )
      case 'beach_layout_elements':
        return toDiagnosticRows([
          ...(this.activeParametricLayout?.elements ?? []),
          ...(this.draftParametricLayout?.elements ?? []),
        ])
      case 'beach_layout_rows':
        return toDiagnosticRows([
          ...(this.activeParametricLayout?.rows ?? []),
          ...(this.draftParametricLayout?.rows ?? []),
        ])
      case 'beach_layout_zones':
        return toDiagnosticRows([
          ...(this.activeParametricLayout?.zones ?? []),
          ...(this.draftParametricLayout?.zones ?? []),
        ])
      case 'beach_layout_distance_rules':
        return toDiagnosticRows(
          [
            this.activeParametricLayout?.distanceRules,
            this.draftParametricLayout?.distanceRules,
          ].filter((row) => Boolean(row)) as BeachLayoutDistanceRulesDefinition[],
        )
      case 'beach_layout_asset_metrics':
        return [
        ]
      case 'customers':
        return toDiagnosticRows(this.customers)
      case 'beach_item_customer_assignments':
        return toDiagnosticRows(this.assignments)
      case 'accounts':
        return toDiagnosticRows(this.accounts)
      case 'payments':
        return toDiagnosticRows(this.payments)
      case 'payment_schedules':
        return toDiagnosticRows(this.paymentSchedules)
      case 'payment_installments':
        return []
      case 'reservations':
        return toDiagnosticRows(this.reservations)
      case 'booking_requests':
        return toDiagnosticRows(this.bookingRequests)
      case 'booking_customer_pairing_candidates':
        return toDiagnosticRows(this.pairingCandidates)
      case 'booking_status_events':
        return toDiagnosticRows(this.bookingStatusEvents)
      case 'booking_conflicts':
        return toDiagnosticRows(this.bookingConflicts)
      case 'availability_locks':
        return toDiagnosticRows(this.availabilityLocks)
      case 'pricing_snapshots':
        return toDiagnosticRows(this.pricingSnapshots)
      case 'booking_folio_links':
        return toDiagnosticRows(this.bookingFolioLinks)
      case 'booking_registry_event_links':
        return toDiagnosticRows(this.bookingRegistryEventLinks)
      case 'tariff_rules':
        return toDiagnosticRows(this.tariffRules)
      case 'tariff_included_items':
        return toDiagnosticRows(this.includedItems)
      case 'extra_item_catalog':
        return toDiagnosticRows(this.extraCatalog)
      case 'account_extra_items':
        return toDiagnosticRows(this.accountExtras)
      default:
        return []
    }
  }

  private validateMemoryReservationInput(input: ReservationInput): void {
    if (!input.itemId || !input.customerId || !isDateRangeValid(input.startDate, input.endDate)) {
      throw new Error('Periodo non valido')
    }
  }

  private isBlockingReservation(reservation: Reservation): boolean {
    return reservation.active && ['draft', 'active'].includes(reservation.status)
  }

  private persistState(): void {
    // BrowserMemoryAdapter is an emergency in-memory fallback. It intentionally
    // does not persist data across reloads.
  }

  async resetBrowserDatabaseForDevelopmentOnly(): Promise<void> {
    await this.resetSeedForDevelopmentOnly()
  }
}

const createBrowserSQLiteAdapter = (): BeachDatabaseAdapter => {
  const webAdapter = new NativeSQLiteAdapter('web-persistent-sqlite')
  const memoryAdapter = new BrowserMemoryAdapter()
  let activeAdapter: BeachDatabaseAdapter = webAdapter
  const WEB_SQLITE_INIT_TIMEOUT_MS = 5000

  const initializeWithTimeout = async () => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    try {
      await Promise.race([
        webAdapter.initialize(),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Timeout inizializzazione SQLite web persistente.'))
          }, WEB_SQLITE_INIT_TIMEOUT_MS)
        }),
      ])
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }

  const browserAdapter = {
    get runtime() {
      return activeAdapter.runtime
    },
    async initialize() {
      try {
        activeAdapter = webAdapter
        await initializeWithTimeout()
      } catch (error) {
        console.warn(
          'SQLite web persistente non disponibile o bloccato. Uso memoria temporanea: i dati verranno persi al reload.',
          error,
        )
        activeAdapter = memoryAdapter
        await memoryAdapter.initialize()
      }
    },
  }

  return new Proxy(browserAdapter, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver)
      }

      const value = activeAdapter[prop as keyof BeachDatabaseAdapter]
      return typeof value === 'function' ? value.bind(activeAdapter) : value
    },
  }) as BeachDatabaseAdapter
}

export const getSQLiteAdapter = (): BeachDatabaseAdapter => {
  if (Capacitor.isNativePlatform()) {
    return new NativeSQLiteAdapter()
  }

  return createBrowserSQLiteAdapter()
}
