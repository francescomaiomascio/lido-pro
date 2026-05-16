import type { BeachItemType } from '../../types/beach'
import { getAssetMetricDefinition, type AssetMetricDefinition } from '../assets/assetMetricDefinitions'
import type { BeachLayoutElement } from './parametricLayoutTypes'

export interface ParametricLayoutInput {
  beach: {
    widthM: number
    depthM: number
    marginsM: {
      top: number
      right: number
      bottom: number
      left: number
    }
    seaSide: 'top' | 'right' | 'bottom' | 'left'
  }
  rows: {
    rowLabel: string
    family: BeachItemType
    itemCount: number
    zoneId: string
    yM?: number
  }[]
  zones: {
    id: string
    type: string
    xM: number
    yM: number
    widthM: number
    heightM: number
  }[]
  assetMetrics?: AssetMetricDefinition[]
  distances: {
    minPalmGapM: number
    minUmbrellaGapM: number
    minSmallPalmGapM: number
    minMixedAssetGapM: number
    minPalmRowGapM: number
    minUmbrellaRowGapM: number
    minZoneGapM: number
    marginFromBoundaryM: number
  }
}

export type ParametricLayoutWarningCode =
  | 'row_too_wide_for_zone'
  | 'min_gap_violation'
  | 'element_outside_zone'
  | 'element_outside_boundary'
  | 'missing_zone'
  | 'missing_asset_metric'

export interface ParametricLayoutWarning {
  code: ParametricLayoutWarningCode
  rowLabel?: string
  message: string
}

export interface ParametricLayoutOutput {
  elements: BeachLayoutElement[]
  warnings: ParametricLayoutWarning[]
}

const metricAssetByFamily: Record<BeachItemType, string> = {
  palm: 'palm_large_top',
  umbrella: 'umbrella_classic_top',
  small_palm: 'palm_small_top',
}

const minGapForFamily = (family: BeachItemType, input: ParametricLayoutInput): number => {
  if (family === 'palm') return input.distances.minPalmGapM
  if (family === 'umbrella') return input.distances.minUmbrellaGapM
  return input.distances.minSmallPalmGapM
}

export function calculateParametricLayout(input: ParametricLayoutInput): ParametricLayoutOutput {
  const elements: BeachLayoutElement[] = []
  const warnings: ParametricLayoutWarning[] = []

  input.rows.forEach((row, rowIndex) => {
    const zone = input.zones.find((candidate) => candidate.id === row.zoneId)

    if (!zone) {
      warnings.push({
        code: 'missing_zone',
        rowLabel: row.rowLabel,
        message: `Zona mancante per la riga ${row.rowLabel}.`,
      })
      return
    }

    const assetMetric =
      input.assetMetrics?.find((metric) => metric.family === row.family) ??
      getAssetMetricDefinition(metricAssetByFamily[row.family])

    if (!assetMetric) {
      warnings.push({
        code: 'missing_asset_metric',
        rowLabel: row.rowLabel,
        message: `Dimensione metrica mancante per ${row.family}.`,
      })
      return
    }

    const count = Math.max(0, row.itemCount)
    if (count === 0) return

    const itemWidthM = assetMetric.defaultWidthM
    const itemHeightM = assetMetric.defaultHeightM
    const usableWidthM = zone.widthM
    const totalItemWidthM = count * itemWidthM
    const gapM = count > 1 ? (usableWidthM - totalItemWidthM) / (count - 1) : 0
    const minGapM = minGapForFamily(row.family, input)

    if (totalItemWidthM > usableWidthM) {
      warnings.push({
        code: 'row_too_wide_for_zone',
        rowLabel: row.rowLabel,
        message: `La riga ${row.rowLabel} non entra nella zona ${zone.id}.`,
      })
    }

    if (count > 1 && gapM < minGapM) {
      warnings.push({
        code: 'min_gap_violation',
        rowLabel: row.rowLabel,
        message: `La riga ${row.rowLabel} ha distanza ${gapM.toFixed(2)}m sotto il minimo ${minGapM.toFixed(2)}m.`,
      })
    }

    const startX = count === 1 ? zone.xM + zone.widthM / 2 : zone.xM + itemWidthM / 2
    const stepX = count === 1 ? 0 : (zone.widthM - itemWidthM) / (count - 1)
    const yM = row.yM ?? zone.yM + zone.heightM / 2

    for (let index = 0; index < count; index += 1) {
      const xM = startX + stepX * index
      const outsideZone =
        xM - itemWidthM / 2 < zone.xM ||
        xM + itemWidthM / 2 > zone.xM + zone.widthM ||
        yM - itemHeightM / 2 < zone.yM ||
        yM + itemHeightM / 2 > zone.yM + zone.heightM
      const outsideBoundary =
        xM - itemWidthM / 2 < 0 ||
        xM + itemWidthM / 2 > input.beach.widthM ||
        yM - itemHeightM / 2 < 0 ||
        yM + itemHeightM / 2 > input.beach.depthM

      if (outsideZone) {
        warnings.push({
          code: 'element_outside_zone',
          rowLabel: row.rowLabel,
          message: `${row.rowLabel}-${index + 1} esce dalla zona ${zone.id}.`,
        })
      }

      if (outsideBoundary) {
        warnings.push({
          code: 'element_outside_boundary',
          rowLabel: row.rowLabel,
          message: `${row.rowLabel}-${index + 1} esce dai limiti spiaggia.`,
        })
      }

      elements.push({
        id: `draft-${row.rowLabel}-${index + 1}`,
        layoutVersionId: 'draft',
        legacyBeachItemId: null,
        code: `${row.rowLabel}-${String(index + 1).padStart(2, '0')}`,
        family: row.family,
        rowLabel: row.rowLabel,
        numberIndex: index + 1,
        xM,
        yM,
        widthM: itemWidthM,
        heightM: itemHeightM,
        diameterM: assetMetric.defaultDiameterM ?? null,
        rotationDeg: 0,
        zoneId: zone.id,
        locked: false,
        active: true,
        zIndex: rowIndex * 100 + index,
      })
    }
  })

  return { elements, warnings }
}
