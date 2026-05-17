import type { ParametricSetupState } from '../../../../lib/map-canvas/parametric/parametricSetupState'
import type { MapStudioProjectEntryMode, MapStudioProjectModel } from './mapStudioProjectModel'
import { projectModelFromSetup } from './mapStudioProjectModel'

export const createEmptyMapStudioProject = (baseSetup: ParametricSetupState): MapStudioProjectModel => ({
  ...projectModelFromSetup(baseSetup, 'empty'),
  id: `${baseSetup.layoutVersionId}-empty-draft`,
  stage: 'perimeter',
  functionalAreas: [],
  tracks: [],
  objectParameters: [],
  previewState: 'unavailable',
  verificationState: 'idle',
  publicationState: 'draft',
})

export const createMapStudioProjectFromMode = (
  baseSetup: ParametricSetupState,
  mode: MapStudioProjectEntryMode,
): MapStudioProjectModel => {
  if (mode === 'empty') return createEmptyMapStudioProject(baseSetup)
  return projectModelFromSetup(baseSetup, mode)
}
