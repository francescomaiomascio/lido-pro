export const DATABASE_NAME = 'beach_bdf.db'
export const SCHEMA_VERSION = 17

export const CREATE_SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS beach_layouts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  width_m REAL NOT NULL,
  depth_m REAL NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS beach_items (
  id TEXT PRIMARY KEY,
  layout_id TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('palm', 'umbrella', 'small_palm')),
  row_label TEXT NOT NULL,
  row_index INTEGER NOT NULL,
  number_index INTEGER NOT NULL,
  x_m REAL NOT NULL,
  y_m REAL NOT NULL,
  width_m REAL NOT NULL,
  height_m REAL NOT NULL,
  rotation_deg REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'free' CHECK(status IN ('free', 'occupied', 'reserved', 'maintenance')),
  usage_type TEXT NOT NULL DEFAULT 'daily' CHECK(usage_type IN ('daily', 'seasonal')),
  operational_note TEXT,
  status_updated_at TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(layout_id, code),
  FOREIGN KEY(layout_id) REFERENCES beach_layouts(id)
);

CREATE TABLE IF NOT EXISTS layout_versions (
  id TEXT PRIMARY KEY,
  layout_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(layout_id) REFERENCES beach_layouts(id)
);

CREATE TABLE IF NOT EXISTS beach_item_status_events (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  previous_status TEXT,
  next_status TEXT NOT NULL CHECK(next_status IN ('free', 'occupied', 'reserved', 'maintenance')),
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(item_id) REFERENCES beach_items(id)
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS beach_item_customer_assignments (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  assignment_type TEXT NOT NULL DEFAULT 'daily' CHECK(assignment_type IN ('daily', 'seasonal')),
  active INTEGER NOT NULL DEFAULT 1,
  assigned_at TEXT NOT NULL,
  unassigned_at TEXT,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(item_id) REFERENCES beach_items(id),
  FOREIGN KEY(customer_id) REFERENCES customers(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_active_customer_assignment_per_item
ON beach_item_customer_assignments(item_id)
WHERE active = 1;

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  assignment_id TEXT,
  account_type TEXT NOT NULL DEFAULT 'daily' CHECK(account_type IN ('daily', 'seasonal')),
  season_label TEXT,
  base_amount_cents INTEGER NOT NULL DEFAULT 0,
  extras_amount_cents INTEGER NOT NULL DEFAULT 0,
  total_amount_cents INTEGER NOT NULL DEFAULT 0,
  paid_amount_cents INTEGER NOT NULL DEFAULT 0,
  balance_amount_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'partial', 'paid', 'cancelled')),
  notes TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(item_id) REFERENCES beach_items(id),
  FOREIGN KEY(customer_id) REFERENCES customers(id),
  FOREIGN KEY(assignment_id) REFERENCES beach_item_customer_assignments(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK(payment_method IN ('cash', 'card', 'transfer', 'other')),
  paid_at TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  assignment_id TEXT,
  account_id TEXT,
  reservation_type TEXT NOT NULL DEFAULT 'daily' CHECK(reservation_type IN ('daily', 'seasonal')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('draft', 'active', 'completed', 'cancelled')),
  title TEXT,
  notes TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'operator',
  booking_mode TEXT NOT NULL DEFAULT 'operator_app',
  booking_status TEXT NOT NULL DEFAULT 'active',
  period_type TEXT NOT NULL DEFAULT 'daily',
  sync_state TEXT NOT NULL DEFAULT 'local',
  remote_id TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  deleted_at TEXT,
  pricing_snapshot_id TEXT,
  folio_id TEXT,
  request_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  cancelled_at TEXT,
  FOREIGN KEY(item_id) REFERENCES beach_items(id),
  FOREIGN KEY(customer_id) REFERENCES customers(id),
  FOREIGN KEY(assignment_id) REFERENCES beach_item_customer_assignments(id),
  FOREIGN KEY(account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS booking_requests (
  id TEXT PRIMARY KEY,
  workspace_id TEXT,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  pairing_status TEXT NOT NULL,
  matched_customer_id TEXT,
  pairing_decision_json TEXT,
  pairing_resolved_at TEXT,
  customer_payload_json TEXT NOT NULL,
  requested_period_json TEXT NOT NULL,
  requested_item_id TEXT,
  requested_item_type TEXT,
  requested_extras_json TEXT,
  converted_reservation_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  sync_state TEXT,
  remote_id TEXT,
  version INTEGER NOT NULL DEFAULT 1
);

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

CREATE TABLE IF NOT EXISTS booking_status_events (
  id TEXT PRIMARY KEY,
  reservation_id TEXT,
  request_id TEXT,
  from_status TEXT,
  to_status TEXT NOT NULL,
  source TEXT NOT NULL,
  reason TEXT,
  payload_json TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT,
  device_id TEXT
);

CREATE TABLE IF NOT EXISTS booking_change_requests (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  booking_request_id TEXT,
  source TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  availability_result_json TEXT,
  account_impact_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  decided_at TEXT,
  decided_by TEXT,
  FOREIGN KEY(reservation_id) REFERENCES reservations(id),
  FOREIGN KEY(booking_request_id) REFERENCES booking_requests(id)
);

CREATE TABLE IF NOT EXISTS booking_conflicts (
  id TEXT PRIMARY KEY,
  reservation_id TEXT,
  request_id TEXT,
  conflict_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  affected_item_ids_json TEXT NOT NULL,
  affected_period_json TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS availability_locks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT,
  item_id TEXT NOT NULL,
  period_json TEXT NOT NULL,
  source TEXT NOT NULL,
  reservation_id TEXT,
  request_id TEXT,
  status TEXT NOT NULL,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pricing_snapshots (
  id TEXT PRIMARY KEY,
  reservation_id TEXT,
  account_id TEXT,
  source TEXT NOT NULL DEFAULT 'operator_app',
  status TEXT NOT NULL DEFAULT 'locked',
  source_rule_id TEXT,
  catalog_item_id TEXT,
  period_type TEXT NOT NULL,
  scope_json TEXT,
  base_price REAL NOT NULL DEFAULT 0,
  extras_total REAL NOT NULL DEFAULT 0,
  discounts_total REAL NOT NULL DEFAULT 0,
  included_items_json TEXT,
  lines_json TEXT,
  calculated_total REAL NOT NULL DEFAULT 0,
  manual_override_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_folio_links (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_registry_event_links (
  id TEXT PRIMARY KEY,
  reservation_id TEXT,
  request_id TEXT,
  registry_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS registry_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT,
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  entity_type TEXT,
  entity_id TEXT,
  reservation_id TEXT,
  request_id TEXT,
  customer_id TEXT,
  account_id TEXT,
  payment_id TEXT,
  item_id TEXT,
  pricing_snapshot_id TEXT,
  amount_cents INTEGER,
  payload_json TEXT,
  dedupe_key TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT,
  device_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_registry_events_created_at ON registry_events(created_at);
CREATE INDEX IF NOT EXISTS idx_registry_events_source ON registry_events(source);
CREATE INDEX IF NOT EXISTS idx_registry_events_type ON registry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_registry_events_reservation ON registry_events(reservation_id);
CREATE INDEX IF NOT EXISTS idx_registry_events_customer ON registry_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_registry_events_account ON registry_events(account_id);
CREATE INDEX IF NOT EXISTS idx_registry_events_item ON registry_events(item_id);
CREATE INDEX IF NOT EXISTS idx_registry_events_dedupe ON registry_events(dedupe_key);

CREATE TABLE IF NOT EXISTS tariff_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK(item_type IN ('palm', 'umbrella', 'small_palm')),
  row_label TEXT,
  reservation_type TEXT NOT NULL DEFAULT 'seasonal' CHECK(reservation_type IN ('daily', 'seasonal')),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  season_year INTEGER,
  valid_from TEXT,
  valid_to TEXT,
  priority INTEGER NOT NULL DEFAULT 100,
  active INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS extra_item_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  unit_label TEXT NOT NULL DEFAULT 'pz',
  default_amount_cents INTEGER NOT NULL DEFAULT 0,
  max_quantity_per_booking INTEGER NOT NULL DEFAULT 99,
  included_quantity_default INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 100,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS account_extra_items (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  catalog_item_id TEXT,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_amount_cents INTEGER NOT NULL DEFAULT 0,
  total_amount_cents INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(account_id) REFERENCES accounts(id),
  FOREIGN KEY(catalog_item_id) REFERENCES extra_item_catalog(id)
);

CREATE TABLE IF NOT EXISTS tariff_included_items (
  id TEXT PRIMARY KEY,
  tariff_rule_id TEXT,
  item_type TEXT NOT NULL,
  row_label TEXT,
  reservation_type TEXT NOT NULL DEFAULT 'seasonal',
  catalog_item_id TEXT,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  included INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(tariff_rule_id) REFERENCES tariff_rules(id),
  FOREIGN KEY(catalog_item_id) REFERENCES extra_item_catalog(id)
);

CREATE TABLE IF NOT EXISTS payment_schedules (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  schedule_type TEXT NOT NULL DEFAULT 'manual' CHECK(schedule_type IN ('manual', 'monthly', 'custom')),
  total_installments INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS payment_installments (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  due_date TEXT NOT NULL,
  expected_amount_cents INTEGER NOT NULL,
  paid_amount_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(schedule_id) REFERENCES payment_schedules(id),
  FOREIGN KEY(account_id) REFERENCES accounts(id)
);
CREATE TABLE IF NOT EXISTS beach_layout_versions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('active', 'draft', 'archived')),
  source TEXT NOT NULL CHECK(source IN ('imported_legacy', 'parametric_engine', 'manual_future')),
  beach_width_m REAL NOT NULL,
  beach_depth_m REAL NOT NULL,
  sea_side TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  activated_at TEXT,
  margin_top_m REAL DEFAULT 0.5,
  margin_right_m REAL DEFAULT 0.5,
  margin_bottom_m REAL DEFAULT 0.5,
  margin_left_m REAL DEFAULT 0.5
);

CREATE TABLE IF NOT EXISTS beach_layout_elements (
  id TEXT PRIMARY KEY,
  layout_version_id TEXT NOT NULL,
  legacy_beach_item_id TEXT,
  code TEXT NOT NULL,
  family TEXT NOT NULL CHECK(family IN ('palm', 'umbrella', 'small_palm', 'furniture', 'map_item')),
  row_label TEXT,
  number_index INTEGER,
  x_m REAL NOT NULL,
  y_m REAL NOT NULL,
  width_m REAL NOT NULL,
  height_m REAL NOT NULL,
  diameter_m REAL,
  rotation_deg REAL NOT NULL DEFAULT 0,
  zone_id TEXT,
  locked INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  z_index INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(layout_version_id) REFERENCES beach_layout_versions(id)
);

CREATE TABLE IF NOT EXISTS beach_layout_rows (
  id TEXT PRIMARY KEY,
  layout_version_id TEXT NOT NULL,
  row_label TEXT NOT NULL,
  family TEXT NOT NULL CHECK(family IN ('palm', 'umbrella', 'small_palm')),
  item_count INTEGER NOT NULL,
  y_m REAL,
  min_gap_m REAL,
  distribution_mode TEXT NOT NULL CHECK(distribution_mode IN ('imported_locked', 'uniform', 'manual_future')),
  zone_id TEXT,
  asset_variant_id TEXT,
  start_margin_m REAL DEFAULT 0,
  end_margin_m REAL DEFAULT 0,
  distribution_axis TEXT DEFAULT 'x',
  locked INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(layout_version_id) REFERENCES beach_layout_versions(id)
);

CREATE TABLE IF NOT EXISTS beach_layout_zones (
  id TEXT PRIMARY KEY,
  layout_version_id TEXT NOT NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  x_m REAL NOT NULL,
  y_m REAL NOT NULL,
  width_m REAL NOT NULL,
  height_m REAL NOT NULL,
  locked INTEGER NOT NULL DEFAULT 1,
  visible INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(layout_version_id) REFERENCES beach_layout_versions(id)
);

CREATE TABLE IF NOT EXISTS beach_layout_distance_rules (
  id TEXT PRIMARY KEY,
  layout_version_id TEXT NOT NULL,
  min_palm_gap_m REAL NOT NULL,
  min_umbrella_gap_m REAL NOT NULL,
  min_small_palm_gap_m REAL NOT NULL,
  min_mixed_asset_gap_m REAL NOT NULL,
  min_palm_row_gap_m REAL NOT NULL,
  min_umbrella_row_gap_m REAL NOT NULL,
  min_zone_gap_m REAL NOT NULL,
  margin_from_boundary_m REAL NOT NULL,
  margin_from_sea_m REAL NOT NULL,
  margin_from_entrance_m REAL NOT NULL,
  FOREIGN KEY(layout_version_id) REFERENCES beach_layout_versions(id)
);

CREATE INDEX IF NOT EXISTS idx_beach_layout_versions_status ON beach_layout_versions(status);
CREATE INDEX IF NOT EXISTS idx_beach_layout_elements_version ON beach_layout_elements(layout_version_id);
CREATE INDEX IF NOT EXISTS idx_beach_layout_elements_legacy ON beach_layout_elements(legacy_beach_item_id);
CREATE INDEX IF NOT EXISTS idx_beach_layout_rows_version ON beach_layout_rows(layout_version_id);
CREATE INDEX IF NOT EXISTS idx_beach_layout_zones_version ON beach_layout_zones(layout_version_id);

CREATE TABLE IF NOT EXISTS beach_layout_asset_metrics (
  id TEXT PRIMARY KEY,
  layout_version_id TEXT NOT NULL,
  asset_family TEXT NOT NULL,
  asset_variant_id TEXT,
  label TEXT NOT NULL,
  width_m REAL NOT NULL,
  height_m REAL NOT NULL,
  diameter_m REAL,
  collision_shape TEXT NOT NULL,
  spacing_class TEXT NOT NULL,
  locked INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(layout_version_id) REFERENCES beach_layout_versions(id)
);

CREATE INDEX IF NOT EXISTS idx_beach_layout_asset_metrics_version ON beach_layout_asset_metrics(layout_version_id);

`
