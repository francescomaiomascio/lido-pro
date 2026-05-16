import type { BeachItem } from '../types/beach'

export interface BeachDisplayCodeParts {
  rowLabel: string
  numberLabel: string
  fullLabel: string
}

export function getBeachDisplayCodeParts(item: BeachItem, items: BeachItem[]): BeachDisplayCodeParts {
  const rowLabel = getGlobalRowDisplayLabel(item, items)
  const numberLabel = String(getSequentialNumberByFamily(item, items))

  return {
    rowLabel,
    numberLabel,
    fullLabel: `${rowLabel}-${numberLabel}`,
  }
}

export function getBeachDisplayCode(item: BeachItem, items: BeachItem[]): string {
  return getBeachDisplayCodeParts(item, items).fullLabel
}

function getSequentialNumberByFamily(item: BeachItem, items: BeachItem[]): number {
  return items
    .filter((candidate) => candidate.type === item.type)
    .toSorted((a, b) => a.rowIndex - b.rowIndex || a.xM - b.xM || a.numberIndex - b.numberIndex)
    .findIndex((candidate) => candidate.id === item.id) + 1
}

function getGlobalRowDisplayLabel(item: BeachItem, items: BeachItem[]): string {
  const orderedRowLabels = [...new Set(
    items
      .toSorted((a, b) => a.rowIndex - b.rowIndex || a.yM - b.yM)
      .map((candidate) => candidate.rowLabel),
  )]
  const index = orderedRowLabels.indexOf(item.rowLabel)
  return String(index >= 0 ? index + 1 : item.rowIndex + 1)
}
