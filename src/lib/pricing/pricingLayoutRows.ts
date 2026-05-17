import type { BeachItem } from '../types/beach'

export type PricingLayoutRow = {
  id: string
  label: string
  rowNumber: number | null
  sourceRowLabel: string | null
  sourceRowLabels: string[]
  itemCount: number
  itemCounts: Record<BeachItem['type'], number>
  activeInLayout: boolean
}

const parseRowNumber = (value: string | null | undefined): number | null => {
  if (!value) return null
  const codeMatch = value.trim().match(/^(\d+)(?:[-_\s]|$)/)
  if (codeMatch) return Number(codeMatch[1])
  const rowMatch = value.trim().match(/(?:fila|row|p|o|pm)\s*(\d+)/i)
  if (rowMatch) return Number(rowMatch[1])
  return null
}

export const derivePricingRowsFromActiveLayout = (layoutItems: BeachItem[]): PricingLayoutRow[] => {
  const rowsByNumber = new Map<number, PricingLayoutRow>()

  for (const item of layoutItems) {
    if (!item.active) continue
    const rowNumber = item.rowIndex || parseRowNumber(item.rowLabel) || parseRowNumber(item.code)
    if (!rowNumber || rowNumber < 1) continue
    const sourceRowLabel = item.rowLabel?.trim() || null
    const existing = rowsByNumber.get(rowNumber)
    if (existing) {
      existing.itemCount += 1
      existing.itemCounts[item.type] += 1
      if (sourceRowLabel && !existing.sourceRowLabels.includes(sourceRowLabel)) {
        existing.sourceRowLabels.push(sourceRowLabel)
      }
      if (!existing.sourceRowLabel && sourceRowLabel) existing.sourceRowLabel = sourceRowLabel
      continue
    }
    rowsByNumber.set(rowNumber, {
      id: `row-${rowNumber}`,
      label: `Fila ${rowNumber}`,
      rowNumber,
      sourceRowLabel,
      sourceRowLabels: sourceRowLabel ? [sourceRowLabel] : [],
      itemCount: 1,
      itemCounts: { palm: item.type === 'palm' ? 1 : 0, umbrella: item.type === 'umbrella' ? 1 : 0, small_palm: item.type === 'small_palm' ? 1 : 0 },
      activeInLayout: true,
    })
  }

  return [
    {
      id: 'all',
      label: 'Tutte le file',
      rowNumber: null,
      sourceRowLabel: null,
      sourceRowLabels: [],
      itemCount: layoutItems.filter((item) => item.active).length,
      itemCounts: {
        palm: layoutItems.filter((item) => item.active && item.type === 'palm').length,
        umbrella: layoutItems.filter((item) => item.active && item.type === 'umbrella').length,
        small_palm: layoutItems.filter((item) => item.active && item.type === 'small_palm').length,
      },
      activeInLayout: true,
    },
    ...[...rowsByNumber.values()].toSorted((a, b) => (a.rowNumber ?? 0) - (b.rowNumber ?? 0)),
  ]
}

export const getPricingRowForTariffLabel = (
  rowLabel: string | null | undefined,
  pricingRows: PricingLayoutRow[],
): PricingLayoutRow => {
  if (!rowLabel) return pricingRows[0]
  const exact = pricingRows.find((row) => row.sourceRowLabels.includes(rowLabel))
  if (exact) return exact
  const parsed = parseRowNumber(rowLabel)
  if (parsed) {
    const byNumber = pricingRows.find((row) => row.rowNumber === parsed)
    if (byNumber) return byNumber
    return {
      id: `missing-row-${parsed}`,
      label: `Fila ${parsed}`,
      rowNumber: parsed,
      sourceRowLabel: rowLabel,
      sourceRowLabels: [rowLabel],
      itemCount: 0,
      itemCounts: { palm: 0, umbrella: 0, small_palm: 0 },
      activeInLayout: false,
    }
  }
  return {
    id: `legacy-${rowLabel.toLowerCase()}`,
    label: 'Fila non nel layout attivo',
    rowNumber: null,
    sourceRowLabel: rowLabel,
    sourceRowLabels: [rowLabel],
    itemCount: 0,
    itemCounts: { palm: 0, umbrella: 0, small_palm: 0 },
    activeInLayout: false,
  }
}
