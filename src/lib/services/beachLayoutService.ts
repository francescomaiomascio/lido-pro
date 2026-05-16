import type { BeachState } from '../types/db'
import {
  getActiveLayout,
  ensureParametricLayoutImported,
  getActiveParametricLayoutBundle,
  getDraftParametricLayoutBundle,
  getBeachItemStatusEvents,
  getBeachItems,
  getBeachStatusSummary,
  getDatabaseRuntime,
  initializeBeachDatabase,
  updateBeachItemOperationalNote,
  updateBeachItemStatus,
  updateBeachItemUsageType,
} from '../db/beachRepository'
import type { BeachItem, BeachItemStatus, BeachItemUsageType } from '../types/beach'
import type { BeachLayoutElement } from '../map-canvas/parametric/parametricLayoutTypes'


export type ParametricLayoutViewMode = 'active' | 'draft' | 'compare'
export const BEACH_LAYOUT_VIEW_CHANGED_EVENT = 'beach:layout-view-changed'
let parametricLayoutViewMode: ParametricLayoutViewMode = 'active'

export const setParametricLayoutViewMode = (mode: ParametricLayoutViewMode) => {
  parametricLayoutViewMode = mode
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BEACH_LAYOUT_VIEW_CHANGED_EVENT, { detail: { mode } }))
  }
}

export const getParametricLayoutViewMode = () => parametricLayoutViewMode

const toBeachItemType = (family: BeachLayoutElement['family']): BeachItem['type'] => {
  if (family === 'umbrella' || family === 'small_palm') return family
  return 'palm'
}

const mergeParametricElementsWithLegacyItems = (
  elements: BeachLayoutElement[],
  legacyItems: BeachItem[],
): BeachItem[] => {
  const legacyById = new Map(legacyItems.map((item) => [item.id, item]))
  const rowOrder = new Map<string, number>()

  elements
    .filter((element) => element.active && element.rowLabel)
    .toSorted((a, b) => a.yM - b.yM || a.xM - b.xM)
    .forEach((element) => {
      const rowLabel = element.rowLabel ?? ''
      if (rowLabel && !rowOrder.has(rowLabel)) {
        rowOrder.set(rowLabel, rowOrder.size + 1)
      }
    })

  return elements
    .filter((element) => element.active)
    .toSorted((a, b) => a.zIndex - b.zIndex || a.yM - b.yM || a.xM - b.xM)
    .map((element, index) => {
      const legacy = element.legacyBeachItemId ? legacyById.get(element.legacyBeachItemId) : undefined
      const rowLabel = element.rowLabel ?? legacy?.rowLabel ?? ''
      return {
        ...(legacy ?? {
          id: element.legacyBeachItemId ?? element.id,
          layoutId: element.layoutVersionId,
          code: element.code,
          type: toBeachItemType(element.family),
          rowLabel,
          rowIndex: rowOrder.get(rowLabel) ?? index + 1,
          numberIndex: element.numberIndex ?? index + 1,
          xM: element.xM,
          yM: element.yM,
          widthM: element.widthM,
          heightM: element.heightM,
          rotationDeg: element.rotationDeg,
          status: 'free',
          usageType: 'daily',
          operationalNote: '',
          statusUpdatedAt: null,
          active: element.active,
        }),
        code: element.code,
        type: toBeachItemType(element.family),
        rowLabel,
        rowIndex: rowOrder.get(rowLabel) ?? legacy?.rowIndex ?? index + 1,
        numberIndex: element.numberIndex ?? legacy?.numberIndex ?? index + 1,
        xM: element.xM,
        yM: element.yM,
        widthM: element.widthM,
        heightM: element.heightM,
        rotationDeg: element.rotationDeg,
        active: element.active,
      }
    })
}

export const loadBeachState = async (): Promise<BeachState> => {
  await initializeBeachDatabase()
  await ensureParametricLayoutImported()
  const layout = await getActiveLayout()
  const legacyItems = await getBeachItems(layout.id)
  const activeParametricLayout = await getActiveParametricLayoutBundle()
  const draftParametricLayout = parametricLayoutViewMode !== 'active' ? await getDraftParametricLayoutBundle() : null
  const displayedParametricLayout = draftParametricLayout ?? activeParametricLayout
  const items = displayedParametricLayout
    ? mergeParametricElementsWithLegacyItems(displayedParametricLayout.elements, legacyItems)
    : legacyItems

  return {
    layout,
    items,
    runtime: getDatabaseRuntime(),
  }
}

export const updateBeachItemStatusAndReload = async (
  itemId: string,
  status: BeachItemStatus,
): Promise<BeachState> => {
  await updateBeachItemStatus(itemId, status)
  return loadBeachState()
}

export const updateBeachItemOperationalNoteAndReload = async (
  itemId: string,
  note: string,
): Promise<BeachState> => {
  await updateBeachItemOperationalNote(itemId, note)
  return loadBeachState()
}

export const updateBeachItemUsageTypeAndReload = async (
  itemId: string,
  usageType: BeachItemUsageType,
): Promise<BeachState> => {
  await updateBeachItemUsageType(itemId, usageType)
  return loadBeachState()
}

export const loadBeachItemStatusEvents = async (itemId: string) => {
  return getBeachItemStatusEvents(itemId)
}

export const loadBeachStatusSummary = async (layoutId: string) => {
  return getBeachStatusSummary(layoutId)
}
