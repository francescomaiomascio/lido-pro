<script lang="ts">
  import { untrack } from 'svelte'
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { BeachDistanceRules } from '../../../lib/map-canvas'
  import MapStudioShell from './MapStudioShell.svelte'
  import {
    clearMapStudioScope,
    createMapStudioProjectState,
    setMapStudioDomain,
    setMapStudioHover,
    setMapStudioScope,
    type MapStudioProjectState,
  } from './MapStudioProjectState'
  import type { MapStudioDomainId } from './mapStudioDomains'
  import type { MapStudioLayerId } from './mapStudioLayers'
  import type { MapStudioAction } from './state/mapStudioActions'
  import { buildMapStudioControlPlane } from './state/mapStudioControlPlane'
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
  const controlPlane = $derived(
    setup && projectState
      ? buildMapStudioControlPlane({ setup, output, state: projectState, distanceRows, draftAvailable })
      : null,
  )

  $effect(() => {
    const currentProjectState = untrack(() => projectState)
    if (!setup) {
      projectState = null
      return
    }
    if (!currentProjectState) {
      projectState = createMapStudioProjectState({
        activeConfigurationId: setup.layoutVersionId,
        previewConfigurationId: draftAvailable ? setup.layoutVersionId : undefined,
        previewAvailable: draftAvailable,
        warningCount: output?.warnings.length ?? 0,
      })
      return
    }
    projectState = {
      ...currentProjectState,
      previewState: draftAvailable ? 'available' : currentProjectState.dirtyState === 'dirty' ? 'stale' : 'unavailable',
      validationState: (output?.warnings.length ?? 0) > 0 ? 'warnings' : 'ready',
      activeConfigurationId: setup.layoutVersionId,
      previewConfigurationId: draftAvailable ? setup.layoutVersionId : undefined,
    }
  })

  const updateProjectState = (updater: (state: MapStudioProjectState) => MapStudioProjectState) => {
    if (!projectState) return
    projectState = updater(projectState)
  }

  const changeDomain = (domain: MapStudioDomainId) => {
    updateProjectState((state) => setMapStudioDomain(state, domain))
  }

  const toggleLayer = (layer: MapStudioLayerId) => {
    updateProjectState((state) => {
      const activeLayerSet = state.activeLayerSet.includes(layer)
        ? state.activeLayerSet.filter((candidate) => candidate !== layer)
        : [...state.activeLayerSet, layer]
      return { ...state, activeLayerSet }
    })
  }

  const ensureLayer = (layer: MapStudioLayerId) => {
    updateProjectState((state) => state.activeLayerSet.includes(layer)
      ? state
      : { ...state, activeLayerSet: [...state.activeLayerSet, layer] })
  }

  const disabledLayers = $derived.by<MapStudioLayerId[]>(() => {
    const disabled: MapStudioLayerId[] = []
    if (!output?.warnings.length) disabled.push('warnings')
    if (!draftAvailable) disabled.push('calculation.preview')
    return disabled
  })

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

  const activateAction = (action: MapStudioAction) => {
    if (action.disabledReason) return
    if (action.id === 'clearScope') {
      clearScope()
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
      onCalculate()
      return
    }
    if (action.id === 'openPreview' || action.id === 'showActiveLayout') {
      onShowDraft()
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') clearScope()
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if !setup || !projectState}
  <section class="map-studio-shell map-studio-shell--loading">
    <div><strong>Setup mappa non caricato</strong><span>{status}</span></div>
    <button type="button" onclick={onReload}>Ricarica setup</button>
  </section>
{:else if controlPlane}
  <MapStudioShell
    {setup}
    {output}
    {status}
    {projectState}
    {controlPlane}
    {draftAvailable}
    {disabledLayers}
    onDomainChange={changeDomain}
    onLayerToggle={toggleLayer}
    onScopeChange={setScope}
    onScopeHover={setHoverScope}
    onClearScope={clearScope}
    onAction={activateAction}
    {onSave}
    {onCalculate}
    {onShowDraft}
    {onUpdateDistance}
  />
{/if}
