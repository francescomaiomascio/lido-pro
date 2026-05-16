import type { MapStudioDomainId } from '../mapStudioDomains'

export type MapStudioEntityKind =
  | 'project'
  | 'perimeter'
  | 'area'
  | 'track'
  | 'objectType'
  | 'object'
  | 'constraint'
  | 'warning'
  | 'configuration'
  | 'preview'

export type MapStudioScopeId =
  | 'project'
  | 'perimeter'
  | `area:${string}`
  | `track:${string}`
  | `objectType:${string}`
  | `object:${string}`
  | `constraint:${string}`
  | `warning:${string}`
  | `configuration:${string}`
  | `preview:${string}`

export interface MapStudioSelectedEntity {
  kind: MapStudioEntityKind
  id: string
  label: string
  domain: MapStudioDomainId
  relatedAreaIds: string[]
  relatedTrackIds: string[]
  relatedObjectTypeIds: string[]
  relatedItemCodes: string[]
  relatedConstraintIds: string[]
  relatedWarningIds: string[]
}

export const projectScopeId: MapStudioScopeId = 'project'

export const scopeFromEntity = (entity: Pick<MapStudioSelectedEntity, 'kind' | 'id'>): MapStudioScopeId => {
  if (entity.kind === 'project') return 'project'
  if (entity.kind === 'perimeter') return 'perimeter'
  return `${entity.kind}:${entity.id}` as MapStudioScopeId
}

export const parseScopeId = (scopeId: MapStudioScopeId): { kind: MapStudioEntityKind; id: string } => {
  if (scopeId === 'project') return { kind: 'project', id: 'project' }
  if (scopeId === 'perimeter') return { kind: 'perimeter', id: 'perimeter' }
  const separatorIndex = scopeId.indexOf(':')
  if (separatorIndex < 0) return { kind: 'project', id: 'project' }
  return {
    kind: scopeId.slice(0, separatorIndex) as MapStudioEntityKind,
    id: scopeId.slice(separatorIndex + 1),
  }
}

export const emptyEntityRelations = {
  relatedAreaIds: [],
  relatedTrackIds: [],
  relatedObjectTypeIds: [],
  relatedItemCodes: [],
  relatedConstraintIds: [],
  relatedWarningIds: [],
}
