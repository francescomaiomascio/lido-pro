import { calculateParametricLayout, type ParametricLayoutWarning } from './parametricLayoutEngine'
import type {
  BeachLayoutElement,
  BeachLayoutRowDefinition,
  BeachLayoutZoneDefinition,
  ParametricLayoutBundle,
} from './parametricLayoutTypes'

export interface LayoutElementDiff {
  key: string
  status: 'moved' | 'added' | 'removed' | 'unchanged'
  active?: BeachLayoutElement
  draft?: BeachLayoutElement
  deltaM?: { x: number; y: number }
}

export interface LayoutRowDiff {
  rowLabel: string
  status: 'changed' | 'added' | 'removed' | 'unchanged'
  active?: BeachLayoutRowDefinition
  draft?: BeachLayoutRowDefinition
}

export interface LayoutZoneDiff {
  key: string
  status: 'changed' | 'added' | 'removed' | 'unchanged'
  active?: BeachLayoutZoneDefinition
  draft?: BeachLayoutZoneDefinition
}

export interface LayoutDiffResult {
  activeVersionId: string
  draftVersionId: string
  summary: {
    totalElements: number
    movedElements: number
    addedElements: number
    removedElements: number
    unchangedElements: number
    rowChanges: number
    zoneChanges: number
    warnings: number
  }
  elements: LayoutElementDiff[]
  rows: LayoutRowDiff[]
  zones: LayoutZoneDiff[]
  warnings: ParametricLayoutWarning[]
}

const coordinateDiffToleranceM = 0.01

const elementKey = (element: BeachLayoutElement) =>
  element.legacyBeachItemId ?? element.code ?? element.id

const sameCoordinate = (a: BeachLayoutElement, b: BeachLayoutElement) =>
  Math.abs(a.xM - b.xM) <= coordinateDiffToleranceM &&
  Math.abs(a.yM - b.yM) <= coordinateDiffToleranceM

export function getLayoutDiff(active: ParametricLayoutBundle, draft: ParametricLayoutBundle): LayoutDiffResult {
  const activeElements = new Map(active.elements.map((element) => [elementKey(element), element]))
  const draftElements = new Map(draft.elements.map((element) => [elementKey(element), element]))
  const keys = new Set([...activeElements.keys(), ...draftElements.keys()])
  const elements: LayoutElementDiff[] = [...keys].map((key) => {
    const activeElement = activeElements.get(key)
    const draftElement = draftElements.get(key)
    if (!activeElement && draftElement) return { key, status: 'added', draft: draftElement }
    if (activeElement && !draftElement) return { key, status: 'removed', active: activeElement }
    if (!activeElement || !draftElement) return { key, status: 'unchanged' }
    if (sameCoordinate(activeElement, draftElement)) {
      return { key, status: 'unchanged', active: activeElement, draft: draftElement, deltaM: { x: 0, y: 0 } }
    }
    return {
      key,
      status: 'moved',
      active: activeElement,
      draft: draftElement,
      deltaM: { x: draftElement.xM - activeElement.xM, y: draftElement.yM - activeElement.yM },
    }
  })

  const activeRows = new Map(active.rows.map((row) => [row.rowLabel, row]))
  const draftRows = new Map(draft.rows.map((row) => [row.rowLabel, row]))
  const rows: LayoutRowDiff[] = [...new Set([...activeRows.keys(), ...draftRows.keys()])].map((rowLabel) => {
    const activeRow = activeRows.get(rowLabel)
    const draftRow = draftRows.get(rowLabel)
    if (!activeRow && draftRow) return { rowLabel, status: 'added', draft: draftRow }
    if (activeRow && !draftRow) return { rowLabel, status: 'removed', active: activeRow }
    const changed = activeRow?.itemCount !== draftRow?.itemCount || activeRow?.yM !== draftRow?.yM
    return { rowLabel, status: changed ? 'changed' : 'unchanged', active: activeRow, draft: draftRow }
  })

  const zoneKey = (zone: BeachLayoutZoneDefinition) => zone.type || zone.id
  const activeZones = new Map(active.zones.map((zone) => [zoneKey(zone), zone]))
  const draftZones = new Map(draft.zones.map((zone) => [zoneKey(zone), zone]))
  const zones: LayoutZoneDiff[] = [...new Set([...activeZones.keys(), ...draftZones.keys()])].map((key) => {
    const activeZone = activeZones.get(key)
    const draftZone = draftZones.get(key)
    if (!activeZone && draftZone) return { key, status: 'added', draft: draftZone }
    if (activeZone && !draftZone) return { key, status: 'removed', active: activeZone }
    const changed =
      activeZone?.xM !== draftZone?.xM ||
      activeZone?.yM !== draftZone?.yM ||
      activeZone?.widthM !== draftZone?.widthM ||
      activeZone?.heightM !== draftZone?.heightM
    return { key, status: changed ? 'changed' : 'unchanged', active: activeZone, draft: draftZone }
  })

  const generatedWarnings = calculateParametricLayout({
    beach: {
      widthM: draft.version.beachWidthM,
      depthM: draft.version.beachDepthM,
      seaSide: draft.version.seaSide,
      marginsM: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
    },
    rows: draft.rows.map((row) => ({
      rowLabel: row.rowLabel,
      family: row.family,
      itemCount: row.itemCount,
      zoneId:
        draft.zones.find((zone) =>
          row.family === 'palm'
            ? zone.type === 'palms'
            : row.family === 'umbrella'
              ? zone.type === 'umbrellas'
              : zone.type === 'small_palms',
        )?.id ?? draft.zones[0]?.id ?? '',
      yM: row.yM ?? undefined,
    })),
    zones: draft.zones.map((zone) => ({
      id: zone.id,
      type: zone.type,
      xM: zone.xM,
      yM: zone.yM,
      widthM: zone.widthM,
      heightM: zone.heightM,
    })),
    distances: draft.distanceRules
      ? {
          minPalmGapM: draft.distanceRules.minPalmGapM,
          minUmbrellaGapM: draft.distanceRules.minUmbrellaGapM,
          minSmallPalmGapM: draft.distanceRules.minSmallPalmGapM,
          minMixedAssetGapM: draft.distanceRules.minMixedAssetGapM,
          minPalmRowGapM: draft.distanceRules.minPalmRowGapM,
          minUmbrellaRowGapM: draft.distanceRules.minUmbrellaRowGapM,
          minZoneGapM: draft.distanceRules.minZoneGapM,
          marginFromBoundaryM: draft.distanceRules.marginFromBoundaryM,
        }
      : {
          minPalmGapM: 1.8,
          minUmbrellaGapM: 1.6,
          minSmallPalmGapM: 1.2,
          minMixedAssetGapM: 1.4,
          minPalmRowGapM: 2.4,
          minUmbrellaRowGapM: 2.2,
          minZoneGapM: 1.5,
          marginFromBoundaryM: 0.5,
        },
  }).warnings

  return {
    activeVersionId: active.version.id,
    draftVersionId: draft.version.id,
    summary: {
      totalElements: draft.elements.length,
      movedElements: elements.filter((element) => element.status === 'moved').length,
      addedElements: elements.filter((element) => element.status === 'added').length,
      removedElements: elements.filter((element) => element.status === 'removed').length,
      unchangedElements: elements.filter((element) => element.status === 'unchanged').length,
      rowChanges: rows.filter((row) => row.status !== 'unchanged').length,
      zoneChanges: zones.filter((zone) => zone.status !== 'unchanged').length,
      warnings: generatedWarnings.length,
    },
    elements,
    rows,
    zones,
    warnings: generatedWarnings,
  }
}
