<script lang="ts">
  import { untrack } from 'svelte'
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { SeaSide } from '../../../lib/map-canvas/types'
  import type { BeachDistanceRules } from '../../../lib/map-canvas'
  import SetupStatePanel from '../../loading/SetupStatePanel.svelte'
  import MapStudioDashboard from './dashboard/MapStudioDashboard.svelte'
  import MapStudioSketchCanvas from './MapStudioSketchCanvas.svelte'
  import {
    cancelMapStudioManipulation,
    clearMapStudioScope,
    commitMapStudioManipulation,
    createMapStudioProjectState,
    finishMapStudioManipulation,
    setMapStudioDomain,
    setMapStudioHover,
    setMapStudioScope,
    setMapStudioTool,
    startMapStudioManipulation,
    updateMapStudioManipulation,
    type MapStudioProjectState,
  } from './MapStudioProjectState'
  import type { MapStudioDomainId } from './mapStudioDomains'
  import type { MapStudioLayerId } from './mapStudioLayers'
  import type { MapStudioAction, MapStudioToolId } from './state/mapStudioActions'
  import { buildMapStudioControlPlane } from './state/mapStudioControlPlane'
  import {
    defaultLayerIdsForLifecycle,
    defaultToolForLifecycle,
    getMapStudioLifecycle,
    type MapStudioLifecycleModel,
  } from './state/mapStudioLifecycle'
  import { projectModelToParametricSetup } from './state/mapStudioGenerators'
  import type { MapStudioSelectedHandle } from './state/mapStudioManipulation'
  import { createMapStudioProjectFromMode } from './state/mapStudioProjectFactories'
  import {
    applyTransactionToProjectModel,
    confirmProjectConstraints,
    confirmProjectPerimeter,
    initializeDefaultAreas,
    initializeDefaultObjectParameters,
    initializeDefaultTracks,
    type MapStudioProjectEntryMode,
  } from './state/mapStudioProjectModel'
  import type { MapStudioScopeId } from './state/mapStudioScope'

  let {
    setup,
    output = null,
    status,
    distanceRows,
    draftAvailable,
    onReload,
    onSave,
    onCalculate,
    onShowDraft,
    onUpdateDistance,
  }: {
    setup: ParametricSetupState | null
    output?: ParametricLayoutOutput | null
    status: string
    distanceRows: Array<{ label: string; key: keyof BeachDistanceRules; hint: string }>
    draftAvailable: boolean
    onReload: () => void
    onSave: () => void
    onCalculate: () => void
    onShowDraft: () => void
    onUpdateDistance: <K extends keyof ParametricSetupState['distanceRules']>(key: K, value: ParametricSetupState['distanceRules'][K]) => void
  } = $props()

  let projectState = $state<MapStudioProjectState | null>(null)
  const liveProjectModel = $derived(
    projectState?.draftTransaction
      ? applyTransactionToProjectModel(projectState.projectModel, projectState.draftTransaction)
      : projectState?.projectModel,
  )
  const editorSetup = $derived(setup && liveProjectModel ? projectModelToParametricSetup(liveProjectModel, setup) : null)
  const editorOutput = $derived(projectState?.activeTool === 'preview' && draftAvailable ? output : null)
  const controlPlane = $derived(
    editorSetup && projectState
      ? buildMapStudioControlPlane({ setup: editorSetup, output: editorOutput, state: projectState, distanceRows, draftAvailable })
      : null,
  )
  const lifecycle = $derived(projectState
    ? getMapStudioLifecycle(projectState, { draftAvailable, warningCount: output?.warnings.length ?? 0 })
    : null)

  const withLifecycleDefaults = (
    state: MapStudioProjectState,
    model?: MapStudioLifecycleModel,
  ): MapStudioProjectState => {
    const lifecycleModel = model ?? getMapStudioLifecycle(state, { draftAvailable, warningCount: output?.warnings.length ?? 0 })
    const availableLayerIds = lifecycleModel.layerControls.filter((layer) => !layer.disabledReason).map((layer) => layer.id)
    const activeLayerSet = state.activeLayerSet.filter((layerId) => availableLayerIds.includes(layerId))
    return {
      ...state,
      activeLayerSet: activeLayerSet.length ? activeLayerSet : defaultLayerIdsForLifecycle(lifecycleModel),
      activeTool: lifecycleModel.toolControls.some((tool) => tool.id === state.activeTool && !tool.disabledReason)
        ? state.activeTool
        : defaultToolForLifecycle(lifecycleModel),
    }
  }

  $effect(() => {
    const currentProjectState = untrack(() => projectState)
    if (!setup) {
      projectState = null
      return
    }
    if (!currentProjectState) {
      return
    }
    projectState = {
      ...currentProjectState,
      previewState: currentProjectState.projectDraft.previewStale
        ? 'stale'
        : draftAvailable
          ? 'available'
          : currentProjectState.dirtyState === 'dirty'
            ? 'stale'
            : 'unavailable',
      validationState: currentProjectState.projectDraft.verificationStale
        ? 'idle'
        : (output?.warnings.length ?? 0) > 0
          ? 'warnings'
          : 'ready',
      activeConfigurationId: setup.layoutVersionId,
      previewConfigurationId: draftAvailable ? setup.layoutVersionId : undefined,
    }
  })

  const updateProjectState = (updater: (state: MapStudioProjectState) => MapStudioProjectState) => {
    if (!projectState) return
    projectState = updater(projectState)
  }

  const startProject = (mode: MapStudioProjectEntryMode) => {
    if (!setup) return
    const projectModel = createMapStudioProjectFromMode(setup, mode)
    const nextState = createMapStudioProjectState({
      activeConfigurationId: setup.layoutVersionId,
      previewConfigurationId: mode === 'existing' && draftAvailable ? setup.layoutVersionId : undefined,
      previewAvailable: mode === 'existing' && draftAvailable,
      warningCount: mode === 'existing' ? output?.warnings.length ?? 0 : 0,
      projectModel,
    })
    projectState = withLifecycleDefaults(nextState)
  }

  const exitProject = () => {
    projectState = null
  }

  const changeDomain = (domain: MapStudioDomainId) => {
    const domainState = lifecycle?.domainStates.find((candidate) => candidate.id === domain)
    if (domainState?.disabledReason) return
    updateProjectState((state) => withLifecycleDefaults(setMapStudioDomain(state, domain)))
  }

  const toggleLayer = (layer: MapStudioLayerId) => {
    const layerControl = lifecycle?.layerControls.find((candidate) => candidate.id === layer)
    if (!layerControl || layerControl.disabledReason) return
    updateProjectState((state) => {
      const activeLayerSet = state.activeLayerSet.includes(layer)
        ? state.activeLayerSet.filter((candidate) => candidate !== layer)
        : [...state.activeLayerSet, layer]
      return { ...state, activeLayerSet }
    })
  }

  const changeTool = (tool: MapStudioToolId) => {
    const toolControl = lifecycle?.toolControls.find((candidate) => candidate.id === tool)
    if (!toolControl || toolControl.disabledReason) return
    const layerHints: Partial<Record<MapStudioToolId, MapStudioLayerId[]>> = {
      measure: ['metric.constraints'],
      perimeterEdit: ['usable.boundary', 'selection.focus'],
      areaEdit: ['functional.areas', 'selection.focus'],
      trackEdit: ['tracks.rows', 'selection.focus'],
      footprintEdit: ['object.footprints', 'selection.focus'],
      constraintEdit: ['metric.constraints', 'tracks.rows', 'selection.focus'],
      verify: ['metric.constraints', 'warnings'],
      preview: ['calculation.preview'],
    }
    updateProjectState((state) => {
      const nextState = setMapStudioTool(state, tool)
      const availableLayerIds = lifecycle?.layerControls.filter((layer) => !layer.disabledReason).map((layer) => layer.id) ?? []
      const activeLayerSet = [...new Set([...nextState.activeLayerSet, ...(layerHints[tool] ?? [])])]
        .filter((layerId) => !availableLayerIds.length || availableLayerIds.includes(layerId))
      return { ...nextState, activeLayerSet }
    })
  }

  const ensureLayer = (layer: MapStudioLayerId) => {
    updateProjectState((state) => state.activeLayerSet.includes(layer)
      ? state
      : { ...state, activeLayerSet: [...state.activeLayerSet, layer] })
  }

  const setScope = (scopeId: MapStudioScopeId) => {
    const entity = controlPlane?.relations.entitiesByScopeId.get(scopeId)
    updateProjectState((state) => setMapStudioScope(state, scopeId, entity))
  }

  const setHoverScope = (scopeId?: MapStudioScopeId) => {
    const entity = scopeId ? controlPlane?.relations.entitiesByScopeId.get(scopeId) : undefined
    updateProjectState((state) => setMapStudioHover(state, entity))
  }

  const clearScope = () => {
    updateProjectState(clearMapStudioScope)
  }

  const setSeaSide = (seaSide: SeaSide) => {
    updateProjectState((state) => ({
      ...state,
      projectModel: {
        ...state.projectModel,
        perimeter: {
          ...state.projectModel.perimeter,
          seaSide,
        },
        verificationState: 'stale',
        previewState: state.projectModel.previewState === 'available' ? 'stale' : state.projectModel.previewState,
        publicationState: 'draft',
      },
      dirtyState: 'dirty',
      validationState: 'idle',
      previewState: state.previewState === 'available' ? 'stale' : state.previewState,
    }))
  }

  const runProjectVerification = () => {
    updateProjectState((state) => ({
      ...state,
      projectModel: { ...state.projectModel, verificationState: 'ready' },
      validationState: 'ready',
    }))
    onCalculate()
  }

  const startManipulation = (handle: MapStudioSelectedHandle, previewOnly = false) => {
    const entity = controlPlane?.relations.entitiesByScopeId.get(handle.targetScope)
    updateProjectState((state) =>
      startMapStudioManipulation(setMapStudioScope(state, handle.targetScope, entity), handle, previewOnly),
    )
  }

  const updateManipulation = (handle: MapStudioSelectedHandle) => {
    updateProjectState((state) => updateMapStudioManipulation(state, handle))
  }

  const finishManipulation = () => {
    updateProjectState(finishMapStudioManipulation)
  }

  const activateAction = (action: MapStudioAction) => {
    if (action.disabledReason) return
    if (action.id === 'clearScope') {
      clearScope()
      return
    }
    if (action.id === 'commitManipulation') {
      updateProjectState(commitMapStudioManipulation)
      return
    }
    if (action.id === 'cancelManipulation') {
      updateProjectState(cancelMapStudioManipulation)
      return
    }
    if (action.id === 'confirmPerimeter') {
      updateProjectState((state) => withLifecycleDefaults({
        ...state,
        activeDomain: 'functionalAreas',
        activeTool: 'areaEdit',
        projectModel: confirmProjectPerimeter(state.projectModel),
        dirtyState: 'dirty',
        validationState: 'idle',
        previewState: state.previewState === 'available' ? 'stale' : state.previewState,
      }))
      return
    }
    if (action.id === 'initializeAreas') {
      updateProjectState((state) => withLifecycleDefaults({
        ...state,
        activeDomain: 'tracks',
        activeTool: 'trackEdit',
        projectModel: initializeDefaultAreas(state.projectModel),
        dirtyState: 'dirty',
        validationState: 'idle',
        previewState: state.previewState === 'available' ? 'stale' : state.previewState,
      }))
      return
    }
    if (action.id === 'initializeTracks') {
      updateProjectState((state) => withLifecycleDefaults({
        ...state,
        activeDomain: 'footprints',
        activeTool: 'footprintEdit',
        projectModel: initializeDefaultTracks(state.projectModel),
        dirtyState: 'dirty',
        validationState: 'idle',
        previewState: state.previewState === 'available' ? 'stale' : state.previewState,
      }))
      return
    }
    if (action.id === 'initializeFootprints') {
      if (!setup) return
      updateProjectState((state) => withLifecycleDefaults({
        ...state,
        activeDomain: 'metricConstraints',
        activeTool: 'constraintEdit',
        projectModel: initializeDefaultObjectParameters(state.projectModel, setup),
        dirtyState: 'dirty',
        validationState: 'idle',
        previewState: state.previewState === 'available' ? 'stale' : state.previewState,
      }))
      return
    }
    if (action.id === 'confirmConstraints') {
      updateProjectState((state) => withLifecycleDefaults({
        ...state,
        activeDomain: 'verification',
        activeTool: 'verify',
        projectModel: confirmProjectConstraints(state.projectModel),
        dirtyState: 'dirty',
        validationState: 'idle',
        previewState: state.previewState === 'available' ? 'stale' : state.previewState,
      }))
      return
    }
    if (action.id === 'switchDomain' && action.domainId) {
      changeDomain(action.domainId)
      return
    }
    if (action.id === 'toggleLayer' && action.layerId) {
      toggleLayer(action.layerId)
      return
    }
    if (action.id === 'focusPerimeter') {
      ensureLayer('usable.boundary')
      setScope('perimeter')
      return
    }
    if (action.id === 'focusScope') {
      ensureLayer('selection.focus')
      if (action.scopeId) setScope(action.scopeId)
      return
    }
    if (action.id === 'runVerification') {
      runProjectVerification()
      return
    }
    if (action.id === 'openPreview' || action.id === 'showActiveLayout') {
      onShowDraft()
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    if (projectState?.draftTransaction) {
      updateProjectState(cancelMapStudioManipulation)
      return
    }
    clearScope()
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if !setup}
  <section class="map-studio-shell map-studio-shell--loading">
    <SetupStatePanel
      eyebrow="Map Studio"
      title="Setup mappa non caricato"
      message={status}
      actionLabel="Ricarica setup"
      tone="attention"
      onAction={onReload}
    />
  </section>
{:else if !projectState}
  <MapStudioDashboard {setup} {output} {draftAvailable} onStart={startProject} {onShowDraft} />
{:else if controlPlane && editorSetup && lifecycle && liveProjectModel}
  <MapStudioSketchCanvas
    projectModel={liveProjectModel}
    {projectState}
    lifecycle={lifecycle}
    onDomainChange={changeDomain}
    onToolChange={changeTool}
    onScopeChange={setScope}
    onScopeHover={setHoverScope}
    onManipulationStart={startManipulation}
    onManipulationUpdate={updateManipulation}
    onManipulationFinish={finishManipulation}
    onSeaSideChange={setSeaSide}
    onAction={activateAction}
    {onSave}
    onCalculate={runProjectVerification}
    {onShowDraft}
    onExitProject={exitProject}
  />
{/if}
