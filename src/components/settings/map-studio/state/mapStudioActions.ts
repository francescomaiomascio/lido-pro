import type { MapStudioDomainId } from '../mapStudioDomains'
import type { MapStudioLayerId } from '../mapStudioLayers'
import type { MapStudioScopeId } from './mapStudioScope'
export {
  defaultToolForDomain,
  getMapStudioTool,
  mapStudioTools,
  toolsForDomain,
  type MapStudioTool,
  type MapStudioToolId,
} from './mapStudioTools'

export type MapStudioActionId =
  | 'clearScope'
  | 'commitManipulation'
  | 'cancelManipulation'
  | 'confirmPerimeter'
  | 'initializeAreas'
  | 'initializeTracks'
  | 'initializeFootprints'
  | 'confirmConstraints'
  | 'focusScope'
  | 'focusPerimeter'
  | 'runVerification'
  | 'openPreview'
  | 'showActiveLayout'
  | 'switchDomain'
  | 'toggleLayer'

export interface MapStudioAction {
  id: MapStudioActionId
  label: string
  tone?: 'primary' | 'secondary'
  domainId?: MapStudioDomainId
  layerId?: MapStudioLayerId
  scopeId?: MapStudioScopeId
  disabledReason?: string
}

export const actionButtonTitle = (action: MapStudioAction) => action.disabledReason ?? action.label
