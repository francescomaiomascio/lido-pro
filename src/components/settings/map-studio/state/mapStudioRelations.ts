import type { BeachDistanceRules } from '../../../../lib/map-canvas'
import type { ParametricLayoutOutput, ParametricLayoutWarning } from '../../../../lib/map-canvas/parametric/parametricLayoutEngine'
import type {
  ParametricSetupAssetMetric,
  ParametricSetupRow,
  ParametricSetupState,
  ParametricSetupZone,
} from '../../../../lib/map-canvas/parametric/parametricSetupState'
import type { BeachItemType } from '../../../../lib/types/beach'
import type { MapStudioSelectedEntity } from './mapStudioScope'

export type MapStudioAreaKey = 'seaEntry' | 'palms' | 'umbrellas' | 'smallPalms' | 'empty' | 'service'
export type MapStudioObjectTypeId = Extract<BeachItemType, 'palm' | 'umbrella' | 'small_palm'>

export interface MapStudioObjectRelation {
  code: string
  family: MapStudioObjectTypeId
  rowId: string
  rowLabel: string
  zoneId: string
  label: string
}

export interface MapStudioConstraintRelation {
  id: string
  label: string
  hint: string
  key?: keyof BeachDistanceRules
  relatedAreaIds: string[]
  relatedTrackIds: string[]
  relatedObjectTypeIds: string[]
  relatedItemCodes: string[]
  relatedWarningIds: string[]
}

export interface MapStudioWarningRelation {
  id: string
  label: string
  warning: ParametricLayoutWarning
  relatedAreaIds: string[]
  relatedTrackIds: string[]
  relatedObjectTypeIds: string[]
  relatedItemCodes: string[]
  relatedConstraintIds: string[]
}

export interface MapStudioRelations {
  areas: ParametricSetupZone[]
  tracks: ParametricSetupRow[]
  objectTypes: ParametricSetupAssetMetric[]
  objects: MapStudioObjectRelation[]
  constraints: MapStudioConstraintRelation[]
  warnings: MapStudioWarningRelation[]
  areaKeyById: Map<string, MapStudioAreaKey>
  areaIdsByKey: Map<MapStudioAreaKey, string[]>
  tracksByAreaId: Map<string, ParametricSetupRow[]>
  tracksByObjectTypeId: Map<string, ParametricSetupRow[]>
  objectsByTrackId: Map<string, MapStudioObjectRelation[]>
  objectsByAreaId: Map<string, MapStudioObjectRelation[]>
  constraintsByAreaId: Map<string, MapStudioConstraintRelation[]>
  constraintsByTrackId: Map<string, MapStudioConstraintRelation[]>
  constraintsByObjectTypeId: Map<string, MapStudioConstraintRelation[]>
  warningsByTrackId: Map<string, MapStudioWarningRelation[]>
  warningsByAreaId: Map<string, MapStudioWarningRelation[]>
  entitiesByScopeId: Map<string, MapStudioSelectedEntity>
}

const objectTypeLabels: Record<MapStudioObjectTypeId, string> = {
  palm: 'Palma',
  umbrella: 'Ombrellone',
  small_palm: 'Palmetta',
}

const canonicalAreaKey = (zone: ParametricSetupZone): MapStudioAreaKey => {
  const type = zone.type.toLowerCase()
  if (type.includes('sea')) return 'seaEntry'
  if (type.includes('umbrella')) return 'umbrellas'
  if (type.includes('small')) return 'smallPalms'
  if (type.includes('palm')) return 'palms'
  if (type.includes('empty')) return 'empty'
  return 'service'
}

export const canonicalAreaRole = canonicalAreaKey

export const objectTypeForAreaKey = (areaKey: MapStudioAreaKey): MapStudioObjectTypeId | null => {
  if (areaKey === 'palms') return 'palm'
  if (areaKey === 'umbrellas') return 'umbrella'
  if (areaKey === 'smallPalms') return 'small_palm'
  return null
}

export const areaKeyForObjectType = (family: string): MapStudioAreaKey | null => {
  if (family === 'palm') return 'palms'
  if (family === 'umbrella') return 'umbrellas'
  if (family === 'small_palm') return 'smallPalms'
  return null
}

export const warningRelationId = (warning: ParametricLayoutWarning, index: number) =>
  `${warning.code}-${warning.rowLabel ?? index}`

const objectCodesForRow = (output: ParametricLayoutOutput | null, row: ParametricSetupRow) => {
  const outputCodes = output?.elements
    .filter((element) => element.rowLabel === row.label && element.family === row.family)
    .map((element) => element.code)
  if (outputCodes?.length) return outputCodes
  return Array.from({ length: row.itemCount }, (_, index) => `${row.label}-${String(index + 1).padStart(2, '0')}`)
}

const addToMap = <K, V>(map: Map<K, V[]>, key: K, value: V) => {
  const values = map.get(key) ?? []
  values.push(value)
  map.set(key, values)
}

const unique = <T>(values: T[]) => [...new Set(values)]

const metricConstraintBlueprints = (
  setup: ParametricSetupState,
  distanceRows: Array<{ label: string; key: keyof BeachDistanceRules; hint: string }>,
): MapStudioConstraintRelation[] => {
  const rowsForFamily = (family: MapStudioObjectTypeId) => setup.rows.filter((row) => row.family === family)
  const areaIdsForFamily = (family: MapStudioObjectTypeId) => unique(rowsForFamily(family).map((row) => row.zoneId))
  const rowIdsForFamily = (family: MapStudioObjectTypeId) => rowsForFamily(family).map((row) => row.id)
  const familyForKey = (key: keyof BeachDistanceRules): MapStudioObjectTypeId | null => {
    if (key.includes('Umbrella')) return 'umbrella'
    if (key.includes('SmallPalm')) return 'small_palm'
    if (key.includes('Palm')) return 'palm'
    return null
  }

  return distanceRows.map((row) => {
    const family = familyForKey(row.key)
    return {
      id: `metric:${row.key}`,
      label: row.label,
      hint: row.hint,
      key: row.key,
      relatedAreaIds: family ? areaIdsForFamily(family) : setup.zones.map((zone) => zone.id),
      relatedTrackIds: family ? rowIdsForFamily(family) : setup.rows.map((setupRow) => setupRow.id),
      relatedObjectTypeIds: family ? [family] : ['palm', 'umbrella', 'small_palm'],
      relatedItemCodes: [],
      relatedWarningIds: [],
    }
  })
}

export function buildMapStudioRelations(input: {
  setup: ParametricSetupState
  output: ParametricLayoutOutput | null
  distanceRows: Array<{ label: string; key: keyof BeachDistanceRules; hint: string }>
}): MapStudioRelations {
  const { setup, output, distanceRows } = input
  const areaKeyById = new Map<string, MapStudioAreaKey>()
  const areaIdsByKey = new Map<MapStudioAreaKey, string[]>()
  const tracksByAreaId = new Map<string, ParametricSetupRow[]>()
  const tracksByObjectTypeId = new Map<string, ParametricSetupRow[]>()
  const objectsByTrackId = new Map<string, MapStudioObjectRelation[]>()
  const objectsByAreaId = new Map<string, MapStudioObjectRelation[]>()
  const constraintsByAreaId = new Map<string, MapStudioConstraintRelation[]>()
  const constraintsByTrackId = new Map<string, MapStudioConstraintRelation[]>()
  const constraintsByObjectTypeId = new Map<string, MapStudioConstraintRelation[]>()
  const warningsByTrackId = new Map<string, MapStudioWarningRelation[]>()
  const warningsByAreaId = new Map<string, MapStudioWarningRelation[]>()
  const entitiesByScopeId = new Map<string, MapStudioSelectedEntity>()

  for (const zone of setup.zones) {
    const areaKey = canonicalAreaKey(zone)
    areaKeyById.set(zone.id, areaKey)
    addToMap(areaIdsByKey, areaKey, zone.id)
  }

  for (const row of setup.rows) {
    addToMap(tracksByAreaId, row.zoneId, row)
    addToMap(tracksByObjectTypeId, row.family, row)
  }

  const objects = setup.rows.flatMap((row) =>
    objectCodesForRow(output, row).map((code) => ({
      code,
      family: row.family as MapStudioObjectTypeId,
      rowId: row.id,
      rowLabel: row.label,
      zoneId: row.zoneId,
      label: code,
    })),
  )

  for (const object of objects) {
    addToMap(objectsByTrackId, object.rowId, object)
    addToMap(objectsByAreaId, object.zoneId, object)
  }

  const metricConstraints = metricConstraintBlueprints(setup, distanceRows)
  const rowConstraints: MapStudioConstraintRelation[] = setup.rows.map((row) => {
    const objectCodes = objectsByTrackId.get(row.id)?.map((object) => object.code) ?? []
    const metricKey =
      row.family === 'umbrella'
        ? 'minUmbrellaGapM'
        : row.family === 'small_palm'
          ? 'minSmallPalmGapM'
          : 'minPalmGapM'
    const metricRow = distanceRows.find((candidate) => candidate.key === metricKey)
    return {
      id: `constraint-${row.id}`,
      label: metricRow?.label ?? `Distanza ${row.label}`,
      hint: metricRow?.hint ?? `Vincolo metrico della riga ${row.label}.`,
      key: metricKey,
      relatedAreaIds: [row.zoneId],
      relatedTrackIds: [row.id],
      relatedObjectTypeIds: [row.family],
      relatedItemCodes: objectCodes,
      relatedWarningIds: [],
    }
  })
  const constraints = [...metricConstraints, ...rowConstraints]

  for (const constraint of constraints) {
    constraint.relatedAreaIds.forEach((areaId) => addToMap(constraintsByAreaId, areaId, constraint))
    constraint.relatedTrackIds.forEach((trackId) => addToMap(constraintsByTrackId, trackId, constraint))
    constraint.relatedObjectTypeIds.forEach((objectTypeId) => addToMap(constraintsByObjectTypeId, objectTypeId, constraint))
  }

  const warnings = (output?.warnings ?? []).map((warning, index): MapStudioWarningRelation => {
    const row = warning.rowLabel ? setup.rows.find((candidate) => candidate.label === warning.rowLabel) : undefined
    const rowObjects = row ? objectsByTrackId.get(row.id) ?? [] : []
    const relatedConstraintIds = row ? constraintsByTrackId.get(row.id)?.map((constraint) => constraint.id) ?? [] : []
    return {
      id: warningRelationId(warning, index),
      label: warning.code,
      warning,
      relatedAreaIds: row ? [row.zoneId] : [],
      relatedTrackIds: row ? [row.id] : [],
      relatedObjectTypeIds: row ? [row.family] : [],
      relatedItemCodes: rowObjects.map((object) => object.code),
      relatedConstraintIds,
    }
  })

  for (const warning of warnings) {
    warning.relatedTrackIds.forEach((trackId) => addToMap(warningsByTrackId, trackId, warning))
    warning.relatedAreaIds.forEach((areaId) => addToMap(warningsByAreaId, areaId, warning))
    for (const constraintId of warning.relatedConstraintIds) {
      const constraint = constraints.find((candidate) => candidate.id === constraintId)
      if (constraint) constraint.relatedWarningIds = unique([...constraint.relatedWarningIds, warning.id])
    }
  }

  entitiesByScopeId.set('project', {
    kind: 'project',
    id: 'project',
    label: setup.beach.name,
    domain: 'perimeter',
    relatedAreaIds: setup.zones.map((zone) => zone.id),
    relatedTrackIds: setup.rows.map((row) => row.id),
    relatedObjectTypeIds: unique(setup.rows.map((row) => row.family)),
    relatedItemCodes: objects.map((object) => object.code),
    relatedConstraintIds: constraints.map((constraint) => constraint.id),
    relatedWarningIds: warnings.map((warning) => warning.id),
  })

  entitiesByScopeId.set('perimeter', {
    kind: 'perimeter',
    id: 'perimeter',
    label: 'Perimetro utile',
    domain: 'perimeter',
    relatedAreaIds: setup.zones.map((zone) => zone.id),
    relatedTrackIds: setup.rows.map((row) => row.id),
    relatedObjectTypeIds: unique(setup.rows.map((row) => row.family)),
    relatedItemCodes: objects.map((object) => object.code),
    relatedConstraintIds: constraints.filter((constraint) => constraint.id.includes('margin')).map((constraint) => constraint.id),
    relatedWarningIds: warnings.map((warning) => warning.id),
  })

  for (const zone of setup.zones) {
    const areaTracks = tracksByAreaId.get(zone.id) ?? []
    const areaObjects = objectsByAreaId.get(zone.id) ?? []
    entitiesByScopeId.set(`area:${zone.id}`, {
      kind: 'area',
      id: zone.id,
      label: zone.label,
      domain: 'functionalAreas',
      relatedAreaIds: [zone.id],
      relatedTrackIds: areaTracks.map((row) => row.id),
      relatedObjectTypeIds: unique(areaTracks.map((row) => row.family)),
      relatedItemCodes: areaObjects.map((object) => object.code),
      relatedConstraintIds: constraintsByAreaId.get(zone.id)?.map((constraint) => constraint.id) ?? [],
      relatedWarningIds: warningsByAreaId.get(zone.id)?.map((warning) => warning.id) ?? [],
    })
  }

  for (const row of setup.rows) {
    const trackObjects = objectsByTrackId.get(row.id) ?? []
    entitiesByScopeId.set(`track:${row.id}`, {
      kind: 'track',
      id: row.id,
      label: `Tracciato ${row.label}`,
      domain: 'tracks',
      relatedAreaIds: [row.zoneId],
      relatedTrackIds: [row.id],
      relatedObjectTypeIds: [row.family],
      relatedItemCodes: trackObjects.map((object) => object.code),
      relatedConstraintIds: constraintsByTrackId.get(row.id)?.map((constraint) => constraint.id) ?? [],
      relatedWarningIds: warningsByTrackId.get(row.id)?.map((warning) => warning.id) ?? [],
    })
  }

  for (const asset of setup.assetMetrics.filter((metric) => ['palm', 'umbrella', 'small_palm'].includes(metric.family))) {
    const rows = tracksByObjectTypeId.get(asset.family) ?? []
    const rowObjects = rows.flatMap((row) => objectsByTrackId.get(row.id) ?? [])
    entitiesByScopeId.set(`objectType:${asset.family}`, {
      kind: 'objectType',
      id: asset.family,
      label: objectTypeLabels[asset.family as MapStudioObjectTypeId] ?? asset.label,
      domain: 'footprints',
      relatedAreaIds: unique(rows.map((row) => row.zoneId)),
      relatedTrackIds: rows.map((row) => row.id),
      relatedObjectTypeIds: [asset.family],
      relatedItemCodes: rowObjects.map((object) => object.code),
      relatedConstraintIds: constraintsByObjectTypeId.get(asset.family)?.map((constraint) => constraint.id) ?? [],
      relatedWarningIds: rows.flatMap((row) => warningsByTrackId.get(row.id)?.map((warning) => warning.id) ?? []),
    })
  }

  for (const object of objects) {
    entitiesByScopeId.set(`object:${object.code}`, {
      kind: 'object',
      id: object.code,
      label: object.label,
      domain: 'footprints',
      relatedAreaIds: [object.zoneId],
      relatedTrackIds: [object.rowId],
      relatedObjectTypeIds: [object.family],
      relatedItemCodes: [object.code],
      relatedConstraintIds: constraintsByTrackId.get(object.rowId)?.map((constraint) => constraint.id) ?? [],
      relatedWarningIds: warningsByTrackId.get(object.rowId)?.map((warning) => warning.id) ?? [],
    })
  }

  for (const constraint of constraints) {
    entitiesByScopeId.set(`constraint:${constraint.id}`, {
      kind: 'constraint',
      id: constraint.id,
      label: constraint.label,
      domain: 'metricConstraints',
      relatedAreaIds: constraint.relatedAreaIds,
      relatedTrackIds: constraint.relatedTrackIds,
      relatedObjectTypeIds: constraint.relatedObjectTypeIds,
      relatedItemCodes: constraint.relatedItemCodes,
      relatedConstraintIds: [constraint.id],
      relatedWarningIds: constraint.relatedWarningIds,
    })
  }

  for (const warning of warnings) {
    entitiesByScopeId.set(`warning:${warning.id}`, {
      kind: 'warning',
      id: warning.id,
      label: warning.warning.message,
      domain: 'verification',
      relatedAreaIds: warning.relatedAreaIds,
      relatedTrackIds: warning.relatedTrackIds,
      relatedObjectTypeIds: warning.relatedObjectTypeIds,
      relatedItemCodes: warning.relatedItemCodes,
      relatedConstraintIds: warning.relatedConstraintIds,
      relatedWarningIds: [warning.id],
    })
  }

  return {
    areas: setup.zones,
    tracks: setup.rows,
    objectTypes: setup.assetMetrics,
    objects,
    constraints,
    warnings,
    areaKeyById,
    areaIdsByKey,
    tracksByAreaId,
    tracksByObjectTypeId,
    objectsByTrackId,
    objectsByAreaId,
    constraintsByAreaId,
    constraintsByTrackId,
    constraintsByObjectTypeId,
    warningsByTrackId,
    warningsByAreaId,
    entitiesByScopeId,
  }
}
