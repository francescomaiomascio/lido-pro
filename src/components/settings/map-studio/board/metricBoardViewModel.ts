import type { BeachItemType } from '../../../../lib/types/beach'
import type { ParametricLayoutOutput } from '../../../../lib/map-canvas/parametric/parametricLayoutEngine'
import type {
  ParametricSetupRow,
  ParametricSetupState,
  ParametricSetupZone,
} from '../../../../lib/map-canvas/parametric/parametricSetupState'

export interface BoardFrame {
  width: number
  height: number
  pad: number
  frameX: number
  frameY: number
  frameW: number
  frameH: number
  scale: number
  seaH: number
  widthM: number
  depthM: number
}

export interface BoardArea {
  zone: ParametricSetupZone
  x: number
  y: number
  w: number
  h: number
  label: string
  role: 'sea' | 'palm' | 'umbrella' | 'small_palm' | 'empty' | 'service'
  itemCount: number
  rowLabels: string[]
}

export interface BoardTrack {
  row: ParametricSetupRow
  zone?: ParametricSetupZone
  x1: number
  x2: number
  y: number
  labelX: number
  labelY: number
  objectCount: number
}

export interface BoardObject {
  code: string
  family: BeachItemType
  rowId: string
  rowLabel: string
  zoneId: string
  x: number
  y: number
  radius: number
  footprintRadius: number
  widthM: number
  heightM: number
}

export interface BoardConstraint {
  id: string
  label: string
  x1: number
  y1: number
  x2: number
  y2: number
  invalid: boolean
}

export interface BoardWarning {
  id: string
  label: string
  x: number
  y: number
}

export interface MetricBoardViewModel {
  frame: BoardFrame
  areas: BoardArea[]
  tracks: BoardTrack[]
  objects: BoardObject[]
  constraints: BoardConstraint[]
  warnings: BoardWarning[]
  x: (value: number) => number
  y: (value: number) => number
  w: (value: number) => number
  h: (value: number) => number
}

const boardWidth = 1100
const boardHeight = 760
const boardPad = 46

export const canonicalZoneLabel = (zone: Pick<ParametricSetupZone, 'label' | 'type'>) => {
  const type = zone.type.toLowerCase()
  if (type.includes('sea')) return 'Mare / ingresso'
  if (type.includes('umbrella')) return 'Ombrelloni'
  if (type.includes('small')) return 'Palmette'
  if (type.includes('palm')) return 'Palme'
  if (type.includes('empty')) return 'Vuota'
  if (type.includes('service') || type.includes('unusable')) return 'Servizi'
  return zone.label.replace(/^Zona\s+/i, '')
}

const zoneRole = (zone: ParametricSetupZone): BoardArea['role'] => {
  const type = zone.type.toLowerCase()
  if (type.includes('sea')) return 'sea'
  if (type.includes('umbrella')) return 'umbrella'
  if (type.includes('small')) return 'small_palm'
  if (type.includes('palm')) return 'palm'
  if (type.includes('empty')) return 'empty'
  return 'service'
}

const assetMetric = (setup: ParametricSetupState, family: BeachItemType) =>
  setup.assetMetrics.find((metric) => metric.family === family)

const metricRadius = (setup: ParametricSetupState, family: BeachItemType, scale: number) => {
  const metric = assetMetric(setup, family)
  const baseM = metric?.defaultDiameterM ?? Math.max(metric?.defaultWidthM ?? 1, metric?.defaultHeightM ?? 1)
  const maxPx = family === 'umbrella' ? 17 : family === 'small_palm' ? 11 : 15
  const minPx = family === 'small_palm' ? 6 : 8
  return Math.max(minPx, Math.min(maxPx, (baseM * scale) / 2))
}

function generatedObjects(setup: ParametricSetupState, frame: BoardFrame, x: (value: number) => number, y: (value: number) => number): BoardObject[] {
  return setup.rows.flatMap((row) => {
    const zone = setup.zones.find((candidate) => candidate.id === row.zoneId)
    if (!zone || row.itemCount <= 0) return []
    const metric = assetMetric(setup, row.family)
    const widthM = metric?.defaultWidthM ?? 1
    const heightM = metric?.defaultHeightM ?? 1
    const radius = metricRadius(setup, row.family, frame.scale)
    const yM = row.yM ?? zone.yM + zone.heightM / 2
    return Array.from({ length: row.itemCount }, (_, index) => {
      const xM = row.itemCount === 1 ? zone.xM + zone.widthM / 2 : zone.xM + ((index + 0.5) * zone.widthM) / row.itemCount
      return {
        code: `${row.label}-${String(index + 1).padStart(2, '0')}`,
        family: row.family,
        rowId: row.id,
        rowLabel: row.label,
        zoneId: zone.id,
        x: x(xM),
        y: y(yM),
        radius,
        footprintRadius: Math.max(radius + 5, Math.max(widthM, heightM) * frame.scale * 0.56),
        widthM,
        heightM,
      }
    })
  })
}

function outputObjects(setup: ParametricSetupState, output: ParametricLayoutOutput, frame: BoardFrame, x: (value: number) => number, y: (value: number) => number): BoardObject[] {
  return output.elements.flatMap((element) => {
    if (element.family !== 'palm' && element.family !== 'umbrella' && element.family !== 'small_palm') return []
    const rowLabel = element.rowLabel ?? 'R'
    const row = setup.rows.find((candidate) => candidate.label === rowLabel)
    const zoneId = element.zoneId ?? row?.zoneId ?? ''
    const family = element.family
    const radius = metricRadius(setup, family, frame.scale)
    return [{
      code: element.code,
      family,
      rowId: row?.id ?? rowLabel,
      rowLabel,
      zoneId,
      x: x(element.xM),
      y: y(element.yM),
      radius,
      footprintRadius: Math.max(radius + 5, Math.max(element.widthM, element.heightM, element.diameterM ?? 0) * frame.scale * 0.56),
      widthM: element.widthM,
      heightM: element.heightM,
    }]
  })
}

export function buildMetricBoardViewModel(setup: ParametricSetupState, output: ParametricLayoutOutput | null): MetricBoardViewModel {
  const usableW = boardWidth - boardPad * 2
  const usableH = boardHeight - boardPad * 2
  const scale = Math.min(usableW / Math.max(setup.beach.widthM, 1), usableH / Math.max(setup.beach.depthM, 1))
  const frameW = setup.beach.widthM * scale
  const frameH = setup.beach.depthM * scale
  const frameX = (boardWidth - frameW) / 2
  const frameY = (boardHeight - frameH) / 2
  const frame: BoardFrame = {
    width: boardWidth,
    height: boardHeight,
    pad: boardPad,
    frameX,
    frameY,
    frameW,
    frameH,
    scale,
    seaH: Math.min(108, frameH * 0.19),
    widthM: setup.beach.widthM,
    depthM: setup.beach.depthM,
  }
  const x = (value: number) => frameX + value * scale
  const y = (value: number) => frameY + value * scale
  const w = (value: number) => value * scale
  const h = (value: number) => value * scale
  const objects = output ? outputObjects(setup, output, frame, x, y) : generatedObjects(setup, frame, x, y)
  const areas: BoardArea[] = setup.zones.map((zone) => {
    const rows = setup.rows.filter((row) => row.zoneId === zone.id)
    return {
      zone,
      x: x(zone.xM),
      y: y(zone.yM),
      w: w(zone.widthM),
      h: h(zone.heightM),
      label: canonicalZoneLabel(zone),
      role: zoneRole(zone),
      itemCount: rows.reduce((total, row) => total + row.itemCount, 0),
      rowLabels: rows.map((row) => row.label),
    }
  })
  const tracks: BoardTrack[] = setup.rows.flatMap((row) => {
    const zone = setup.zones.find((candidate) => candidate.id === row.zoneId)
    if (!zone) return []
    const yM = row.yM ?? zone.yM + zone.heightM / 2
    return [{
      row,
      zone,
      x1: x(zone.xM) + 16,
      x2: x(zone.xM + zone.widthM) - 16,
      y: y(yM),
      labelX: Math.max(frameX + 12, x(zone.xM) - 38),
      labelY: y(yM),
      objectCount: row.itemCount,
    }]
  })
  const selectedCandidateTracks = tracks.filter((track) => track.objectCount > 1).slice(0, 3)
  const constraints: BoardConstraint[] = selectedCandidateTracks.map((track) => {
    const rowObjects = objects.filter((object) => object.rowId === track.row.id).slice(0, 2)
    const distance = track.row.family === 'umbrella'
      ? setup.distanceRules.minUmbrellaGapM
      : track.row.family === 'small_palm'
        ? setup.distanceRules.minSmallPalmGapM
        : setup.distanceRules.minPalmGapM
    return {
      id: `constraint-${track.row.id}`,
      label: `${distance.toFixed(1).replace('.', ',')}m`,
      x1: rowObjects[0]?.x ?? track.x1,
      y1: track.y - 18,
      x2: rowObjects[1]?.x ?? Math.min(track.x1 + 70, track.x2),
      y2: track.y - 18,
      invalid: Boolean(output?.warnings.some((warning) => warning.rowLabel === track.row.label)),
    }
  })
  const warnings: BoardWarning[] = (output?.warnings ?? []).slice(0, 8).map((warning, index) => {
    const track = tracks.find((candidate) => candidate.row.label === warning.rowLabel)
    return {
      id: `${warning.code}-${warning.rowLabel ?? index}`,
      label: warning.code,
      x: track ? Math.min(track.x2 + 18, frameX + frameW - 20) : frameX + frameW - 24,
      y: track ? track.y : frameY + 28 + index * 24,
    }
  })

  return { frame, areas, tracks, objects, constraints, warnings, x, y, w, h }
}
