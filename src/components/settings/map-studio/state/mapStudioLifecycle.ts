import type { MapStudioProjectState } from '../MapStudioProjectState'
import { mapStudioDomains, type MapStudioDomain, type MapStudioDomainId } from '../mapStudioDomains'
import { mapStudioLayers, type MapStudioLayer, type MapStudioLayerId } from '../mapStudioLayers'
import { getMapStudioTool, type MapStudioTool, type MapStudioToolId } from './mapStudioTools'

export type MapStudioProjectLifecycleState =
  | 'entry'
  | 'emptyProject'
  | 'perimeterDefined'
  | 'areasDefined'
  | 'tracksDefined'
  | 'footprintsDefined'
  | 'constraintsDefined'
  | 'verificationReady'
  | 'previewReady'
  | 'publicationReady'

export type MapStudioProjectMode = 'newEmpty' | 'fromBaseTemplate' | 'openConfiguration'

export type MapStudioActiveStage =
  | 'entry'
  | 'perimeter'
  | 'areas'
  | 'tracks'
  | 'footprints'
  | 'constraints'
  | 'verification'
  | 'publication'

export interface MapStudioProjectCompleteness {
  hasPerimeter: boolean
  hasFunctionalAreas: boolean
  hasTracks: boolean
  hasObjectParameters: boolean
  hasMetricConstraints: boolean
  canVerify: boolean
  canPreview: boolean
  canPublish: boolean
  isDirty: boolean
  isVerificationStale: boolean
  isPreviewStale: boolean
  previewReady: boolean
}

export interface MapStudioDomainStageState extends MapStudioDomain {
  activeStage: MapStudioActiveStage
  disabledReason?: string
}

export interface MapStudioLayerControl extends MapStudioLayer {
  disabledReason?: string
}

export interface MapStudioToolControl extends MapStudioTool {
  disabledReason?: string
}

export interface MapStudioLifecycleModel {
  projectMode: MapStudioProjectMode
  activeStage: MapStudioActiveStage
  projectLifecycleState: MapStudioProjectLifecycleState
  completeness: MapStudioProjectCompleteness
  stageLabel: string
  modeLabel: string
  nextStepLabel: string
  stateLabel: string
  domainStates: MapStudioDomainStageState[]
  layerControls: MapStudioLayerControl[]
  toolControls: MapStudioToolControl[]
}

const stageRank: Record<Exclude<MapStudioActiveStage, 'entry'>, number> = {
  perimeter: 0,
  areas: 1,
  tracks: 2,
  footprints: 3,
  constraints: 4,
  verification: 5,
  publication: 6,
}

const stageForDomain: Record<MapStudioDomainId, MapStudioActiveStage> = {
  perimeter: 'perimeter',
  functionalAreas: 'areas',
  tracks: 'tracks',
  footprints: 'footprints',
  metricConstraints: 'constraints',
  verification: 'verification',
  versionsPublication: 'publication',
}

const stageLabels: Record<MapStudioActiveStage, string> = {
  entry: 'Avvio progetto',
  perimeter: 'Perimetro',
  areas: 'Aree funzionali',
  tracks: 'Tracciati',
  footprints: 'Ingombri',
  constraints: 'Vincoli metrici',
  verification: 'Verifica',
  publication: 'Versioni / Pubblicazione',
}

const projectModeFromState = (state: MapStudioProjectState): MapStudioProjectMode => {
  if (state.projectModel.sourceMode === 'empty') return 'newEmpty'
  if (state.projectModel.sourceMode === 'template') return 'fromBaseTemplate'
  return 'openConfiguration'
}

export const projectModeLongLabel = (mode: MapStudioProjectMode) => {
  if (mode === 'newEmpty') return 'Progetto vuoto'
  if (mode === 'fromBaseTemplate') return 'Bozza da layout base'
  return 'Configurazione caricata'
}

const modelStageRank = (state: MapStudioProjectState) => {
  const modelStage = state.projectModel.stage === 'preview' ? 'publication' : state.projectModel.stage
  return stageRank[modelStage as Exclude<MapStudioActiveStage, 'entry'>] ?? 0
}

const hasReachedStage = (state: MapStudioProjectState, stage: Exclude<MapStudioActiveStage, 'entry'>) =>
  state.projectModel.sourceMode !== 'empty' || modelStageRank(state) >= stageRank[stage]

export const getMapStudioProjectCompleteness = (
  state: MapStudioProjectState,
  input: { draftAvailable: boolean; warningCount: number },
): MapStudioProjectCompleteness => {
  const hasPerimeter = hasReachedStage(state, 'areas')
  const hasFunctionalAreas = state.projectModel.functionalAreas.some((area) => area.enabled && area.depthM > 0)
  const hasTracks = state.projectModel.tracks.some((track) => track.enabled)
  const hasObjectParameters = state.projectModel.objectParameters.length > 0
  const hasMetricConstraints = state.projectModel.sourceMode !== 'empty' || hasReachedStage(state, 'verification')
  const isDirty = state.dirtyState === 'dirty' || state.projectDraft.dirty
  const isVerificationStale =
    state.projectDraft.verificationStale ||
    state.projectModel.verificationState === 'stale' ||
    state.validationState === 'idle'
  const isPreviewStale =
    state.projectDraft.previewStale ||
    state.projectModel.previewState === 'stale' ||
    state.previewState === 'stale'
  const canVerify = hasPerimeter && hasFunctionalAreas && hasTracks && hasObjectParameters && hasMetricConstraints
  const previewReady = input.draftAvailable || state.previewState === 'available' || state.projectModel.previewState === 'available'
  const canPreview = canVerify && !isVerificationStale && state.validationState !== 'invalid'
  const canPublish = previewReady && !isPreviewStale

  return {
    hasPerimeter,
    hasFunctionalAreas,
    hasTracks,
    hasObjectParameters,
    hasMetricConstraints,
    canVerify,
    canPreview,
    canPublish,
    isDirty,
    isVerificationStale,
    isPreviewStale,
    previewReady,
  }
}

const lifecycleState = (
  state: MapStudioProjectState,
  completeness: MapStudioProjectCompleteness,
): MapStudioProjectLifecycleState => {
  if (completeness.canPublish) return 'publicationReady'
  if (completeness.previewReady) return 'previewReady'
  if (completeness.canVerify && !completeness.isVerificationStale) return 'verificationReady'
  if (completeness.hasMetricConstraints) return 'constraintsDefined'
  if (completeness.hasObjectParameters) return 'footprintsDefined'
  if (completeness.hasTracks) return 'tracksDefined'
  if (completeness.hasFunctionalAreas) return 'areasDefined'
  if (completeness.hasPerimeter) return 'perimeterDefined'
  if (state.projectModel.sourceMode === 'empty') return 'emptyProject'
  return 'perimeterDefined'
}

const domainDisabledReason = (
  domainId: MapStudioDomainId,
  completeness: MapStudioProjectCompleteness,
) => {
  if (domainId === 'perimeter') return undefined
  if (domainId === 'functionalAreas' && !completeness.hasPerimeter) return 'Definisci il perimetro prima di creare le aree.'
  if (domainId === 'tracks' && !completeness.hasFunctionalAreas) return 'Definisci le aree funzionali prima dei tracciati.'
  if (domainId === 'footprints' && !completeness.hasTracks) return 'Definisci i tracciati prima degli ingombri.'
  if (domainId === 'metricConstraints' && !completeness.hasObjectParameters) return 'Definisci ingombri e clearance prima dei vincoli.'
  if (domainId === 'verification' && !completeness.canVerify) return 'Completa perimetro, aree, tracciati, ingombri e vincoli prima della verifica.'
  if (domainId === 'versionsPublication' && !completeness.previewReady) return 'Genera una anteprima verificata prima di aprire pubblicazione e versioni.'
  return undefined
}

const stageLayerIds = (
  activeStage: MapStudioActiveStage,
  completeness: MapStudioProjectCompleteness,
): MapStudioLayerId[] => {
  if (activeStage === 'perimeter') return ['usable.boundary', 'sea.edge', 'selection.focus']
  if (activeStage === 'areas') return ['usable.boundary', 'functional.areas', 'sea.edge', 'selection.focus']
  if (activeStage === 'tracks') return ['functional.areas', 'tracks.rows', 'selection.focus']
  if (activeStage === 'footprints') return ['functional.areas', 'tracks.rows', 'object.footprints', 'selection.focus']
  if (activeStage === 'constraints') return ['tracks.rows', 'object.footprints', 'metric.constraints', 'selection.focus']
  if (activeStage === 'verification') return ['metric.constraints', 'warnings', completeness.previewReady ? 'calculation.preview' : 'selection.focus']
  if (activeStage === 'publication') return ['calculation.preview', 'warnings', 'selection.focus']
  return ['usable.boundary']
}

const layerDisabledReason = (
  layerId: MapStudioLayerId,
  completeness: MapStudioProjectCompleteness,
  warningCount: number,
) => {
  if (layerId === 'functional.areas' && !completeness.hasFunctionalAreas) return 'Le aree non sono ancora definite.'
  if (layerId === 'tracks.rows' && !completeness.hasTracks) return 'I tracciati non sono ancora definiti.'
  if (layerId === 'object.footprints' && !completeness.hasObjectParameters) return 'Gli ingombri non sono ancora definiti.'
  if (layerId === 'metric.constraints' && !completeness.hasObjectParameters) return 'Definisci ingombri e clearance prima dei vincoli.'
  if (layerId === 'warnings' && warningCount === 0) return 'Nessun warning disponibile.'
  if (layerId === 'calculation.preview' && !completeness.previewReady) return 'Anteprima non ancora disponibile.'
  return undefined
}

const toolIdsForStage = (activeStage: MapStudioActiveStage): MapStudioToolId[] => {
  if (activeStage === 'perimeter') return ['select', 'measure', 'perimeterEdit']
  if (activeStage === 'areas') return ['select', 'areaEdit', 'measure']
  if (activeStage === 'tracks') return ['select', 'trackEdit', 'measure']
  if (activeStage === 'footprints') return ['select', 'footprintEdit', 'measure']
  if (activeStage === 'constraints') return ['select', 'constraintEdit', 'measure']
  if (activeStage === 'verification') return ['verify', 'select', 'measure']
  if (activeStage === 'publication') return ['preview', 'verify', 'select']
  return ['select']
}

const toolDisabledReason = (
  toolId: MapStudioToolId,
  completeness: MapStudioProjectCompleteness,
) => {
  if (toolId === 'areaEdit' && !completeness.hasPerimeter) return 'Prima conferma il perimetro.'
  if (toolId === 'trackEdit' && !completeness.hasFunctionalAreas) return 'Prima definisci le aree.'
  if (toolId === 'footprintEdit' && !completeness.hasTracks) return 'Prima definisci i tracciati.'
  if (toolId === 'constraintEdit' && !completeness.hasObjectParameters) return 'Prima definisci gli ingombri.'
  if (toolId === 'verify' && !completeness.canVerify) return 'Il modello non e ancora verificabile.'
  if (toolId === 'preview' && !completeness.previewReady) return 'Anteprima non ancora disponibile.'
  return undefined
}

const nextStepLabel = (
  activeStage: MapStudioActiveStage,
  completeness: MapStudioProjectCompleteness,
) => {
  if (activeStage === 'perimeter') return completeness.hasPerimeter ? 'Aggiorna il perimetro o passa alle aree.' : 'Definisci perimetro utile, lato mare e margini.'
  if (activeStage === 'areas') return completeness.hasFunctionalAreas ? 'Aree pronte: passa ai tracciati.' : 'Crea le aree funzionali del progetto.'
  if (activeStage === 'tracks') return completeness.hasTracks ? 'Tracciati pronti: passa agli ingombri.' : 'Definisci file, tracciati e spaziature.'
  if (activeStage === 'footprints') return completeness.hasObjectParameters ? 'Ingombri pronti: passa ai vincoli.' : 'Definisci footprint e clearance dei tipi oggetto.'
  if (activeStage === 'constraints') return completeness.hasMetricConstraints ? 'Vincoli pronti: esegui la verifica.' : 'Conferma le distanze minime e i margini metrici.'
  if (activeStage === 'verification') return completeness.canVerify ? 'Esegui verifica e aggiorna anteprima.' : 'Completa il modello prima della verifica.'
  if (activeStage === 'publication') return completeness.previewReady ? 'Apri anteprima o salva una versione progetto.' : 'Genera una anteprima prima della pubblicazione.'
  return 'Scegli una modalita progetto.'
}

const stateLabel = (completeness: MapStudioProjectCompleteness) => {
  if (completeness.isDirty && completeness.isPreviewStale) return 'Anteprima non aggiornata'
  if (completeness.isDirty && completeness.isVerificationStale) return 'Verifica da aggiornare'
  if (completeness.previewReady) return 'Anteprima disponibile'
  if (completeness.canVerify) return 'Pronto per verifica'
  return 'Modello in costruzione'
}

export const getMapStudioLifecycle = (
  state: MapStudioProjectState,
  input: { draftAvailable: boolean; warningCount: number },
): MapStudioLifecycleModel => {
  const completeness = getMapStudioProjectCompleteness(state, input)
  const activeStage = stageForDomain[state.activeDomain]
  const projectMode = projectModeFromState(state)
  const layerIds = stageLayerIds(activeStage, completeness)
  const domainStates = mapStudioDomains.map((domain) => ({
    ...domain,
    activeStage: stageForDomain[domain.id],
    disabledReason: domainDisabledReason(domain.id, completeness),
  }))
  const layerControls = layerIds.map((layerId) => {
    const layer = mapStudioLayers.find((candidate) => candidate.id === layerId)!
    return {
      ...layer,
      disabledReason: layerDisabledReason(layerId, completeness, input.warningCount),
    }
  }).filter(Boolean)
  const toolControls = toolIdsForStage(activeStage).map((toolId) => ({
    ...getMapStudioTool(toolId),
    disabledReason: toolDisabledReason(toolId, completeness),
  }))

  return {
    projectMode,
    activeStage,
    projectLifecycleState: lifecycleState(state, completeness),
    completeness,
    stageLabel: stageLabels[activeStage],
    modeLabel: projectModeLongLabel(projectMode),
    nextStepLabel: nextStepLabel(activeStage, completeness),
    stateLabel: stateLabel(completeness),
    domainStates,
    layerControls,
    toolControls,
  }
}

export const defaultLayerIdsForLifecycle = (lifecycle: MapStudioLifecycleModel): MapStudioLayerId[] =>
  lifecycle.layerControls
    .filter((layer) => !layer.disabledReason)
    .map((layer) => layer.id)

export const defaultToolForLifecycle = (lifecycle: MapStudioLifecycleModel): MapStudioToolId =>
  lifecycle.toolControls.find((tool) => !tool.disabledReason)?.id ?? 'select'
