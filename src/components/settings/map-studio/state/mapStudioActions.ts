import type { MapStudioDomainId } from '../mapStudioDomains'
import type { MapStudioLayerId } from '../mapStudioLayers'
import type { MapStudioScopeId } from './mapStudioScope'

export type MapStudioActionId =
  | 'clearScope'
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
