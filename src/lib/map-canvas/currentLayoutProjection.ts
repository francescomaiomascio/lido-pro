import type { BeachItem } from '../types/beach'
import type { CanvasAssetType, CanvasMapElement } from './types'

export function projectCurrentLayoutToCanvasElements(items: BeachItem[]): CanvasMapElement[] {
  const sequentialNumbers = getSequentialNumbersByFamily(items)

  return items.map((item) => ({
    id: item.id,
    assetType: toCanvasAssetType(item.type),
    code: item.code,
    rowLabel: item.rowLabel,
    storedNumber: item.numberIndex,
    sequentialNumber: sequentialNumbers.get(item.id) ?? item.numberIndex,
    xM: item.xM,
    yM: item.yM,
    widthM: item.widthM,
    heightM: item.heightM,
    rotationDeg: item.rotationDeg,
    locked: true,
    active: item.active,
    zIndex: getCanvasElementZIndex(item),
  }))
}

function getSequentialNumbersByFamily(items: BeachItem[]): Map<string, number> {
  const result = new Map<string, number>()
  const families: BeachItem['type'][] = ['palm', 'umbrella', 'small_palm']

  for (const family of families) {
    const ordered = items
      .filter((item) => item.type === family)
      .toSorted((a, b) => a.rowIndex - b.rowIndex || a.xM - b.xM || a.numberIndex - b.numberIndex)

    ordered.forEach((item, index) => result.set(item.id, index + 1))
  }

  return result
}

function toCanvasAssetType(type: BeachItem['type']): CanvasAssetType {
  if (type === 'umbrella') {
    return 'umbrella'
  }

  if (type === 'small_palm') {
    return 'small_palm'
  }

  return 'palm'
}

function getCanvasElementZIndex(item: BeachItem): number {
  return item.rowIndex * 100 + item.numberIndex
}
