import { getLayoutDiff, type LayoutDiffResult } from './layoutDiff'
import type { ParametricLayoutOutput } from './parametricLayoutEngine'
import type { BeachLayoutVersion, ParametricLayoutBundle } from './parametricLayoutTypes'
import type { ParametricSetupState } from './parametricSetupState'
import { getBeachDatabase } from '../../db/database'

export const PARAMETRIC_LAYOUT_CHANGED_EVENT = 'beach:parametric-layout-changed'

const emitLayoutChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PARAMETRIC_LAYOUT_CHANGED_EVENT))
  }
}

export async function ensureParametricLayoutImported(): Promise<void> {
  await getBeachDatabase().ensureParametricLayoutImported()
}

export async function getLayoutVersions(): Promise<BeachLayoutVersion[]> {
  return getBeachDatabase().getParametricLayoutVersions()
}

export async function getActiveLayout(): Promise<ParametricLayoutBundle | null> {
  return getBeachDatabase().getActiveParametricLayoutBundle()
}

export async function getActiveLayoutVersion(): Promise<BeachLayoutVersion | null> {
  return (await getActiveLayout())?.version ?? null
}

export async function getDraftLayout(): Promise<ParametricLayoutBundle | null> {
  return getBeachDatabase().getDraftParametricLayoutBundle()
}

export async function getDraftLayoutVersions(): Promise<BeachLayoutVersion[]> {
  return (await getLayoutVersions()).filter((version) => version.status === 'draft')
}

export async function getArchivedLayoutVersions(): Promise<BeachLayoutVersion[]> {
  return (await getLayoutVersions()).filter((version) => version.status === 'archived')
}

export async function getLayoutBundle(versionId: string): Promise<ParametricLayoutBundle | null> {
  return getBeachDatabase().getParametricLayoutBundle(versionId)
}

export async function createDraftFromActive(): Promise<ParametricLayoutBundle> {
  const draft = await getBeachDatabase().createParametricDraftFromActive()
  emitLayoutChanged()
  return draft
}

export async function deleteDraftLayout(versionId: string): Promise<void> {
  await getBeachDatabase().deleteDraftParametricLayout(versionId)
  emitLayoutChanged()
}

export async function archiveLayout(versionId: string): Promise<never> {
  throw new Error(`Archiviazione diretta non consentita per ${versionId}. Usa attiva bozza.`)
}

export async function activateDraftLayout(versionId: string): Promise<void> {
  await getBeachDatabase().activateDraftParametricLayout(versionId)
  emitLayoutChanged()
}

export async function restoreArchivedLayout(versionId: string): Promise<ParametricLayoutBundle> {
  const draft = await getBeachDatabase().restoreArchivedParametricLayout(versionId)
  emitLayoutChanged()
  return draft
}

export async function getLayoutDiffResult(
  activeVersionId: string,
  draftVersionId: string,
): Promise<LayoutDiffResult> {
  const active = await getLayoutBundle(activeVersionId)
  const draft = await getLayoutBundle(draftVersionId)

  if (!active || !draft) {
    throw new Error('Layout active/draft non disponibile per il confronto.')
  }

  return getLayoutDiff(active, draft)
}

export async function getLayoutDiffForCurrentDraft(): Promise<LayoutDiffResult | null> {
  const active = await getActiveLayout()
  const draft = await getDraftLayout()

  if (!active || !draft) return null
  return getLayoutDiff(active, draft)
}

export async function getLayoutElements() {
  return (await getActiveLayout())?.elements ?? []
}

export async function getLayoutRows() {
  return (await getActiveLayout())?.rows ?? []
}

export async function getLayoutZones() {
  return (await getActiveLayout())?.zones ?? []
}

export async function getDistanceRules() {
  return (await getActiveLayout())?.distanceRules ?? null
}

export async function loadParametricSetupDraft(versionId: string): Promise<ParametricSetupState> {
  return getBeachDatabase().loadParametricSetupDraft(versionId)
}

export async function saveParametricSetupDraft(state: ParametricSetupState): Promise<void> {
  await getBeachDatabase().saveParametricSetupDraft(state)
  emitLayoutChanged()
}

export async function calculateAndSaveDraft(state: ParametricSetupState): Promise<ParametricLayoutOutput> {
  const output = await getBeachDatabase().calculateAndSaveParametricDraft(state)
  emitLayoutChanged()
  return output
}

export async function saveDraftLayout(): Promise<ParametricLayoutBundle> {
  return createDraftFromActive()
}
