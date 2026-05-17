import type { BeachDistanceRules } from '../../../../lib/map-canvas'
import type { ParametricLayoutOutput } from '../../../../lib/map-canvas/parametric/parametricLayoutEngine'
import type {
  ParametricSetupAssetMetric,
  ParametricSetupRow,
  ParametricSetupState,
  ParametricSetupZone,
} from '../../../../lib/map-canvas/parametric/parametricSetupState'
import type { MapStudioProjectState } from '../MapStudioProjectState'
import type { MapStudioDomainId } from '../mapStudioDomains'
import type { MapStudioLayerId } from '../mapStudioLayers'
import { layersForDomain } from '../mapStudioLayers'
import { getMapStudioTool, type MapStudioAction } from './mapStudioActions'
import { getMapStudioLifecycle } from './mapStudioLifecycle'
import { formatHandleValue, manipulationStateLabel } from './mapStudioManipulation'
import type { MapStudioRelations } from './mapStudioRelations'
import type { MapStudioScopeId, MapStudioSelectedEntity } from './mapStudioScope'

export interface MapStudioMetricRow {
  label: string
  value: string
  tone?: 'default' | 'warning' | 'positive'
}

export interface MapStudioConstraintDockRow {
  label: string
  key: keyof BeachDistanceRules
  hint: string
  priority: 'primary' | 'secondary'
}

export interface MapStudioDockChip {
  id: string
  label: string
  scopeId: MapStudioScopeId
  active: boolean
}

export interface MapStudioDockModel {
  domainLabel: string
  title: string
  subtitle: string
  scopeLabel: string
  toolLabel: string
  manipulationLabel: string
  editingLabel?: string
  currentValue?: string
  proposedValue?: string
  hint?: string
  metrics: MapStudioMetricRow[]
  areaChips: MapStudioDockChip[]
  trackChips: MapStudioDockChip[]
  objectTypeChips: MapStudioDockChip[]
  constraintRows: MapStudioConstraintDockRow[]
  primaryAction?: MapStudioAction
  secondaryActions: MapStudioAction[]
}

export interface MapStudioBoardEmphasisModel {
  emphasizedAreaIds: string[]
  mutedAreaIds: string[]
  emphasizedTrackIds: string[]
  mutedTrackIds: string[]
  emphasizedObjectTypeIds: string[]
  emphasizedItemCodes: string[]
  mutedItemCodes: string[]
  emphasizedConstraintIds: string[]
  visibleWarningIds: string[]
  selectedEntity?: MapStudioSelectedEntity
  hoveredEntity?: MapStudioSelectedEntity
  focusRingTarget?: MapStudioScopeId
}

const unique = <T>(values: T[]) => [...new Set(values)]

const domainLabels: Record<MapStudioDomainId, string> = {
  perimeter: 'Perimetro',
  functionalAreas: 'Aree funzionali',
  tracks: 'Tracciati',
  footprints: 'Ingombri',
  metricConstraints: 'Vincoli metrici',
  verification: 'Verifica',
  versionsPublication: 'Versioni / Pubblicazione',
}

const getEntityFromState = (state: MapStudioProjectState, relations: MapStudioRelations) =>
  state.selectedEntity ?? relations.entitiesByScopeId.get(state.activeScope) ?? relations.entitiesByScopeId.get('project')

const scopedRelationIds = (state: MapStudioProjectState, relations: MapStudioRelations) => {
  const selectedEntity = getEntityFromState(state, relations)
  if (!selectedEntity || selectedEntity.kind === 'project') {
    return {
      areaIds: relations.areas.map((area) => area.id),
      trackIds: relations.tracks.map((track) => track.id),
      objectTypeIds: unique(relations.tracks.map((track) => track.family)),
      itemCodes: relations.objects.map((object) => object.code),
      constraintIds: relations.constraints.map((constraint) => constraint.id),
      warningIds: relations.warnings.map((warning) => warning.id),
    }
  }
  return {
    areaIds: selectedEntity.relatedAreaIds,
    trackIds: selectedEntity.relatedTrackIds,
    objectTypeIds: selectedEntity.relatedObjectTypeIds,
    itemCodes: selectedEntity.relatedItemCodes,
    constraintIds: selectedEntity.relatedConstraintIds,
    warningIds: selectedEntity.relatedWarningIds,
  }
}

export const getActiveScope = (state: MapStudioProjectState) => state.activeScope
export const getActiveDomain = (state: MapStudioProjectState) => state.activeDomain
export const getActiveLayerSet = (state: MapStudioProjectState) => state.activeLayerSet

export const getScopedAreas = (state: MapStudioProjectState, relations: MapStudioRelations): ParametricSetupZone[] => {
  const ids = scopedRelationIds(state, relations).areaIds
  return relations.areas.filter((area) => ids.includes(area.id))
}

export const getScopedTracks = (state: MapStudioProjectState, relations: MapStudioRelations): ParametricSetupRow[] => {
  const ids = scopedRelationIds(state, relations).trackIds
  return relations.tracks.filter((track) => ids.includes(track.id))
}

export const getScopedObjectTypes = (state: MapStudioProjectState, relations: MapStudioRelations): ParametricSetupAssetMetric[] => {
  const ids = scopedRelationIds(state, relations).objectTypeIds
  return relations.objectTypes.filter((asset) => ids.includes(asset.family))
}

export const getScopedItems = (state: MapStudioProjectState, relations: MapStudioRelations) => {
  const codes = scopedRelationIds(state, relations).itemCodes
  return relations.objects.filter((object) => codes.includes(object.code))
}

export const getScopedConstraints = (state: MapStudioProjectState, relations: MapStudioRelations) => {
  const ids = scopedRelationIds(state, relations).constraintIds
  return relations.constraints.filter((constraint) => ids.includes(constraint.id))
}

export const getScopedWarnings = (state: MapStudioProjectState, relations: MapStudioRelations) => {
  const ids = scopedRelationIds(state, relations).warningIds
  return relations.warnings.filter((warning) => ids.includes(warning.id))
}

const fallbackConstraintKeys = (domain: MapStudioDomainId): Array<keyof BeachDistanceRules> => {
  if (domain === 'footprints') return ['minMixedAssetGapM', 'marginFromBoundaryM']
  if (domain === 'metricConstraints') return ['minPalmGapM', 'minUmbrellaGapM', 'minSmallPalmGapM', 'minZoneGapM']
  return ['marginFromBoundaryM', 'marginFromSeaM', 'marginFromEntranceM']
}

const constraintDockRows = (
  state: MapStudioProjectState,
  relations: MapStudioRelations,
  distanceRows: Array<{ label: string; key: keyof BeachDistanceRules; hint: string }>,
): MapStudioConstraintDockRow[] => {
  const scopedKeys = unique(getScopedConstraints(state, relations).flatMap((constraint) => constraint.key ? [constraint.key] : []))
  const primaryKeys = scopedKeys.length ? scopedKeys : fallbackConstraintKeys(state.activeDomain)
  return [
    ...distanceRows
      .filter((row) => primaryKeys.includes(row.key))
      .map((row) => ({ ...row, priority: 'primary' as const })),
    ...distanceRows
      .filter((row) => !primaryKeys.includes(row.key))
      .map((row) => ({ ...row, priority: 'secondary' as const })),
  ]
}

const scopeTitle = (state: MapStudioProjectState, relations: MapStudioRelations, setup: ParametricSetupState) => {
  const entity = getEntityFromState(state, relations)
  if (!entity || entity.kind === 'project') return setup.beach.name
  return entity.label
}

const scopeLabel = (state: MapStudioProjectState, relations: MapStudioRelations) => {
  const entity = getEntityFromState(state, relations)
  if (!entity || entity.kind === 'project') return 'Scope progetto'
  if (entity.kind === 'area') return 'Scope area'
  if (entity.kind === 'track') return 'Scope tracciato'
  if (entity.kind === 'objectType') return 'Scope tipo oggetto'
  if (entity.kind === 'object') return 'Scope oggetto'
  if (entity.kind === 'constraint') return 'Scope vincolo'
  if (entity.kind === 'warning') return 'Scope warning'
  if (entity.kind === 'preview') return 'Scope anteprima'
  return 'Scope operativo'
}

const dockSubtitle = (state: MapStudioProjectState, relations: MapStudioRelations, setup: ParametricSetupState, output: ParametricLayoutOutput | null) => {
  const scopedTracks = getScopedTracks(state, relations)
  const scopedItems = getScopedItems(state, relations)
  const scopedConstraints = getScopedConstraints(state, relations)
  const scopedWarnings = getScopedWarnings(state, relations)
  if (state.activeDomain === 'perimeter') {
    return `${setup.beach.widthM}m × ${setup.beach.depthM}m · lato mare ${setup.beach.seaSide}`
  }
  if (state.activeDomain === 'verification') {
    return `${setup.rows.length} tracciati · ${output?.warnings.length ?? 0} warning · ${state.previewState === 'available' ? 'anteprima disponibile' : 'anteprima da generare'}`
  }
  if (state.activeDomain === 'versionsPublication') {
    return `${state.activeConfigurationId ?? setup.layoutVersionId} · ${state.previewState === 'available' ? 'Anteprima disponibile' : 'Anteprima non disponibile'}`
  }
  return `${scopedTracks.map((track) => track.label).join(', ') || 'tutti i tracciati'} · ${scopedItems.length} elementi · ${scopedConstraints.length} vincoli · ${scopedWarnings.length} warning`
}

const dockHint = (state: MapStudioProjectState, relations: MapStudioRelations) => {
  const entity = getEntityFromState(state, relations)
  if (state.hoveredEntity) return `Hover: ${state.hoveredEntity.label}`
  if (!entity || entity.kind === 'project') return 'Scope progetto attivo. Seleziona area, tracciato, oggetto, vincolo o warning sulla tavola.'
  if (state.activeDomain === 'tracks') return `${entity.label} correlato a ${entity.relatedTrackIds.length} tracciati.`
  if (state.activeDomain === 'footprints') return `${entity.label} correlato a ${entity.relatedObjectTypeIds.join(', ') || 'nessun tipo oggetto'}.`
  if (state.activeDomain === 'metricConstraints') return `${entity.label} correlato a ${entity.relatedConstraintIds.length} vincoli metrici.`
  return `${entity.label} mantiene lo scope mentre cambi dominio.`
}

const primaryAction = (state: MapStudioProjectState, draftAvailable: boolean): MapStudioAction | undefined => {
  const lifecycle = getMapStudioLifecycle(state, { draftAvailable, warningCount: 0 })
  const { completeness } = lifecycle
  const layerAction = (layerId: MapStudioLayerId, visibleLabel: string, hiddenLabel: string): MapStudioAction => ({
    id: 'toggleLayer',
    label: state.activeLayerSet.includes(layerId) ? hiddenLabel : visibleLabel,
    tone: 'primary',
    layerId,
  })
  if (state.draftTransaction) {
    return {
      id: state.draftTransaction.canCommit ? 'commitManipulation' : 'cancelManipulation',
      label: state.draftTransaction.canCommit ? 'Conferma modifica' : 'Chiudi misura',
      tone: 'primary',
    }
  }
  if (state.activeDomain === 'perimeter' && !completeness.hasPerimeter) {
    return { id: 'confirmPerimeter', label: 'Conferma perimetro', tone: 'primary' }
  }
  if (state.activeDomain === 'functionalAreas') {
    if (!completeness.hasPerimeter) return { id: 'confirmPerimeter', label: 'Conferma prima il perimetro', tone: 'primary' }
    if (!completeness.hasFunctionalAreas) return { id: 'initializeAreas', label: 'Crea aree base', tone: 'primary' }
    return { id: 'switchDomain', label: 'Passa ai tracciati', tone: 'primary', domainId: 'tracks' }
  }
  if (state.activeDomain === 'tracks') {
    if (!completeness.hasFunctionalAreas) return { id: 'initializeAreas', label: 'Crea prima le aree', tone: 'primary' }
    if (!completeness.hasTracks) return { id: 'initializeTracks', label: 'Crea tracciati base', tone: 'primary' }
    return { id: 'switchDomain', label: 'Passa agli ingombri', tone: 'primary', domainId: 'footprints' }
  }
  if (state.activeDomain === 'footprints') {
    if (!completeness.hasTracks) return { id: 'initializeTracks', label: 'Crea prima i tracciati', tone: 'primary' }
    if (!completeness.hasObjectParameters) return { id: 'initializeFootprints', label: 'Crea ingombri base', tone: 'primary' }
    return { id: 'switchDomain', label: 'Passa ai vincoli', tone: 'primary', domainId: 'metricConstraints' }
  }
  if (state.activeDomain === 'metricConstraints' && !completeness.hasMetricConstraints) {
    return { id: 'confirmConstraints', label: 'Conferma vincoli', tone: 'primary' }
  }
  if (state.activeTool === 'verify') {
    return {
      id: 'runVerification',
      label: state.activeDomain === 'metricConstraints' ? 'Verifica vincoli' : 'Esegui verifica',
      tone: 'primary',
      disabledReason: completeness.canVerify ? undefined : 'Completa il modello prima della verifica.',
    }
  }
  if (state.activeTool === 'preview') {
    return {
      id: 'openPreview',
      label: 'Apri anteprima',
      tone: 'primary',
      disabledReason: draftAvailable ? undefined : "Esegui una verifica prima di aprire l'anteprima.",
    }
  }
  if (state.activeTool === 'measure') {
    return layerAction('metric.constraints', 'Mostra misure', 'Nascondi misure')
  }
  if (state.activeTool === 'areaEdit' && !state.projectModel.functionalAreas.some((area) => area.enabled)) {
    return { id: 'initializeAreas', label: 'Crea aree base', tone: 'primary' }
  }
  if (state.activeTool === 'trackEdit' && !state.projectModel.tracks.some((track) => track.enabled)) {
    return {
      id: state.projectModel.functionalAreas.some((area) => area.enabled) ? 'initializeTracks' : 'initializeAreas',
      label: state.projectModel.functionalAreas.some((area) => area.enabled) ? 'Crea tracciati base' : 'Crea prima le aree',
      tone: 'primary',
    }
  }
  if (state.activeTool === 'footprintEdit') {
    return layerAction('object.footprints', 'Parametra ingombri', 'Nascondi ingombri')
  }
  if (state.activeTool === 'constraintEdit') {
    return layerAction('metric.constraints', 'Mostra vincoli', 'Nascondi vincoli')
  }
  if (state.activeTool === 'trackEdit') {
    return layerAction('tracks.rows', 'Mostra tracciati', 'Nascondi tracciati')
  }
  if (state.activeTool === 'areaEdit') {
    return layerAction('functional.areas', 'Mostra aree', 'Nascondi aree')
  }
  if (state.activeTool === 'perimeterEdit') {
    return { id: 'focusPerimeter', label: 'Mostra handle perimetro', tone: 'primary', layerId: 'usable.boundary' }
  }
  if (state.activeDomain === 'verification') {
    return {
      id: 'runVerification',
      label: 'Esegui verifica',
      tone: 'primary',
      disabledReason: completeness.canVerify ? undefined : 'Completa il modello prima della verifica.',
    }
  }
  if (state.activeDomain === 'versionsPublication') {
    return {
      id: 'openPreview',
      label: 'Apri anteprima',
      tone: 'primary',
      disabledReason: draftAvailable ? undefined : "Esegui una verifica prima di aprire l'anteprima.",
    }
  }
  if (state.activeDomain === 'metricConstraints') {
    return { id: 'runVerification', label: 'Verifica vincoli', tone: 'primary' }
  }
  return { id: 'focusPerimeter', label: 'Aggiorna perimetro', tone: 'primary', layerId: 'usable.boundary' }
}

const secondaryActions = (state: MapStudioProjectState, draftAvailable: boolean): MapStudioAction[] => {
  const actions: MapStudioAction[] = []
  const lifecycle = getMapStudioLifecycle(state, { draftAvailable, warningCount: 0 })
  if (state.draftTransaction?.canCancel && state.draftTransaction.canCommit) actions.push({ id: 'cancelManipulation', label: 'Annulla' })
  if (state.activeScope !== 'project') actions.push({ id: 'clearScope', label: 'Cancella scope' })
  const nextDomain =
    state.activeDomain === 'perimeter'
      ? 'functionalAreas'
      : state.activeDomain === 'functionalAreas'
        ? 'tracks'
        : state.activeDomain === 'tracks'
          ? 'footprints'
          : state.activeDomain === 'footprints'
            ? 'metricConstraints'
            : state.activeDomain === 'metricConstraints'
              ? 'verification'
              : state.activeDomain === 'verification'
                ? 'versionsPublication'
                : undefined
  if (nextDomain) {
    const domainState = lifecycle.domainStates.find((domain) => domain.id === nextDomain)
    actions.push({
      id: 'switchDomain',
      label: `Vai a ${domainState?.shortLabel ?? 'stage successivo'}`,
      domainId: nextDomain,
      disabledReason: domainState?.disabledReason,
    })
  }
  if (draftAvailable && state.activeDomain !== 'versionsPublication') actions.push({ id: 'openPreview', label: 'Apri anteprima' })
  return actions.slice(0, 2)
}

export const getDockModel = (input: {
  setup: ParametricSetupState
  output: ParametricLayoutOutput | null
  state: MapStudioProjectState
  relations: MapStudioRelations
  distanceRows: Array<{ label: string; key: keyof BeachDistanceRules; hint: string }>
  draftAvailable: boolean
}): MapStudioDockModel => {
  const { setup, output, state, relations, distanceRows, draftAvailable } = input
  const scopedAreas = getScopedAreas(state, relations)
  const scopedTracks = getScopedTracks(state, relations)
  const scopedObjectTypes = getScopedObjectTypes(state, relations)
  const scopedItems = getScopedItems(state, relations)
  const scopedWarnings = getScopedWarnings(state, relations)
  const activeEntity = getEntityFromState(state, relations)
  const handle = state.selectedHandle
  const lastDraftParameter = state.projectDraft.changedParameters.slice(-1)[0]
  const manipulationLabel = manipulationStateLabel({
    activeManipulation: state.activeManipulation,
    hasDraftTransaction: Boolean(state.draftTransaction),
    hasProjectDraft: state.projectDraft.dirty,
    previewState: state.previewState,
  })
  const metricRows: MapStudioMetricRow[] =
    state.activeDomain === 'perimeter'
      ? [
          { label: 'Perimetro', value: `${setup.beach.widthM}m × ${setup.beach.depthM}m` },
          { label: 'Lato mare', value: setup.beach.seaSide },
          { label: 'Margini', value: `${setup.beach.marginsM.top}/${setup.beach.marginsM.right}/${setup.beach.marginsM.bottom}/${setup.beach.marginsM.left}m` },
        ]
      : state.activeDomain === 'verification'
        ? [
            { label: 'Input', value: `${setup.zones.length} aree · ${setup.rows.length} tracciati` },
            { label: 'Warning', value: `${output?.warnings.length ?? 0}`, tone: (output?.warnings.length ?? 0) > 0 ? 'warning' : 'positive' },
            { label: 'Anteprima', value: draftAvailable ? 'Anteprima disponibile' : 'Da generare' },
          ]
        : state.activeDomain === 'versionsPublication'
          ? [
              { label: 'Mostra layout attivo protetto', value: state.activeConfigurationId ?? setup.layoutVersionId },
              { label: 'Configurazione progetto', value: setup.status === 'draft_calculated' ? 'Calcolata' : 'In modifica' },
              { label: 'Anteprima', value: draftAvailable ? 'Anteprima disponibile' : 'Da generare' },
            ]
          : state.activeDomain === 'footprints'
            ? [
                {
                  label: 'Tipo oggetto',
                  value: scopedObjectTypes.map((asset) => asset.label).join(', ') || 'Tutti',
                },
                {
                  label: 'Footprint',
                  value: scopedObjectTypes[0]
                    ? scopedObjectTypes[0].defaultDiameterM
                      ? `${scopedObjectTypes[0].defaultDiameterM}m Ø`
                      : `${scopedObjectTypes[0].defaultWidthM}m × ${scopedObjectTypes[0].defaultHeightM}m`
                    : 'Misto',
                },
                {
                  label: 'Righe interessate',
                  value: scopedTracks.map((track) => track.label).join(', ') || 'Tutte',
                },
              ]
          : [
              { label: 'Aree', value: `${scopedAreas.length}` },
              { label: 'Tracciati', value: scopedTracks.map((track) => track.label).join(', ') || 'Tutti' },
              { label: 'Elementi', value: `${scopedItems.length}` },
            ]

  return {
    domainLabel: domainLabels[state.activeDomain],
    title: scopeTitle(state, relations, setup),
    subtitle: dockSubtitle(state, relations, setup, output),
    scopeLabel: scopeLabel(state, relations),
    toolLabel: getMapStudioTool(state.activeTool).label,
    manipulationLabel,
    editingLabel: handle?.label ?? lastDraftParameter?.label,
    currentValue: handle
      ? formatHandleValue(handle.currentValue, handle.unit)
      : lastDraftParameter
        ? formatHandleValue(lastDraftParameter.currentValue, lastDraftParameter.unit)
        : undefined,
    proposedValue: handle
      ? formatHandleValue(handle.proposedValue, handle.unit)
      : lastDraftParameter
        ? formatHandleValue(lastDraftParameter.proposedValue, lastDraftParameter.unit)
        : undefined,
    hint: dockHint(state, relations),
    metrics: metricRows,
    areaChips: relations.areas
      .filter((area) => state.activeDomain === 'functionalAreas' || scopedAreas.some((scopedArea) => scopedArea.id === area.id))
      .map((area) => ({ id: area.id, label: area.label, scopeId: `area:${area.id}` as MapStudioScopeId, active: activeEntity?.kind === 'area' && activeEntity.id === area.id })),
    trackChips: relations.tracks
      .filter((track) => state.activeDomain === 'tracks' || scopedTracks.some((scopedTrack) => scopedTrack.id === track.id))
      .map((track) => ({ id: track.id, label: track.label, scopeId: `track:${track.id}` as MapStudioScopeId, active: activeEntity?.kind === 'track' && activeEntity.id === track.id })),
    objectTypeChips: scopedObjectTypes.map((asset) => ({
      id: asset.family,
      label: asset.label,
      scopeId: `objectType:${asset.family}` as MapStudioScopeId,
      active: activeEntity?.kind === 'objectType' && activeEntity.id === asset.family,
    })),
    constraintRows: constraintDockRows(state, relations, distanceRows),
    primaryAction: primaryAction(state, draftAvailable),
    secondaryActions: secondaryActions(state, draftAvailable),
  }
}

export const getPrimaryAction = (dock: MapStudioDockModel) => dock.primaryAction
export const getSecondaryActions = (dock: MapStudioDockModel) => dock.secondaryActions

const activeDomainLayers = (state: MapStudioProjectState): MapStudioLayerId[] => unique([...layersForDomain(state.activeDomain), ...state.activeLayerSet])

export const getBoardEmphasisModel = (state: MapStudioProjectState, relations: MapStudioRelations): MapStudioBoardEmphasisModel => {
  const layers = activeDomainLayers(state)
  const selectedEntity = getEntityFromState(state, relations)
  const scope = scopedRelationIds(state, relations)
  const hasScope = Boolean(selectedEntity && selectedEntity.kind !== 'project')
  const allAreaIds = relations.areas.map((area) => area.id)
  const allTrackIds = relations.tracks.map((track) => track.id)
  const allItemCodes = relations.objects.map((object) => object.code)
  const shouldDim = hasScope || ['tracks', 'footprints', 'metricConstraints'].includes(state.activeDomain)
  const emphasizedAreaIds = layers.includes('functional.areas') || hasScope ? scope.areaIds : []
  const emphasizedTrackIds = layers.includes('tracks.rows') || hasScope ? scope.trackIds : []
  const emphasizedObjectTypeIds = layers.includes('object.footprints') || hasScope ? scope.objectTypeIds : []
  const emphasizedItemCodes = layers.includes('object.footprints') || hasScope ? scope.itemCodes : []
  const emphasizedConstraintIds = layers.includes('metric.constraints') || hasScope ? scope.constraintIds : []
  const visibleWarningIds = layers.includes('warnings') ? (scope.warningIds.length ? scope.warningIds : relations.warnings.map((warning) => warning.id)) : []

  return {
    emphasizedAreaIds,
    mutedAreaIds: shouldDim ? allAreaIds.filter((areaId) => !emphasizedAreaIds.includes(areaId)) : [],
    emphasizedTrackIds,
    mutedTrackIds: shouldDim ? allTrackIds.filter((trackId) => !emphasizedTrackIds.includes(trackId)) : [],
    emphasizedObjectTypeIds,
    emphasizedItemCodes,
    mutedItemCodes: shouldDim ? allItemCodes.filter((code) => !emphasizedItemCodes.includes(code)) : [],
    emphasizedConstraintIds,
    visibleWarningIds,
    selectedEntity: selectedEntity?.kind === 'project' ? undefined : selectedEntity,
    hoveredEntity: state.hoveredEntity,
    focusRingTarget: selectedEntity?.kind === 'project' ? undefined : state.activeScope,
  }
}
