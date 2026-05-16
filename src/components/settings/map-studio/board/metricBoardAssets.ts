import type { BeachItemType } from '../../../../lib/types/beach'

export const boardAssetSymbol = (family: BeachItemType) => {
  if (family === 'umbrella') return '#board-symbol-umbrella'
  if (family === 'small_palm') return '#board-symbol-palmetta'
  return '#board-symbol-palm'
}

export const boardFamilyClass = (family: BeachItemType) => {
  if (family === 'umbrella') return 'is-umbrella'
  if (family === 'small_palm') return 'is-palmetta'
  return 'is-palm'
}
