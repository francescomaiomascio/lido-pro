<script lang="ts">
  import { untrack } from 'svelte'
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { BeachDistanceRules } from '../../../lib/map-canvas'
  import MapStudioShell from './MapStudioShell.svelte'
  import { createMapStudioProjectState, setMapStudioDomain, type MapStudioProjectState } from './MapStudioProjectState'
  import type { MapStudioDomainId } from './mapStudioDomains'
  import type { MapStudioLayerId } from './mapStudioLayers'

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

  const disabledLayers = $derived.by<MapStudioLayerId[]>(() => {
    const disabled: MapStudioLayerId[] = []
    if (!output?.warnings.length) disabled.push('warnings')
    if (!draftAvailable) disabled.push('calculation.preview')
    return disabled
  })

  const selectZone = (id: string) => {
    updateProjectState((state) => ({
      ...state,
      activeScope: `area:${id}`,
      selectedAreaId: id,
      selectedTrackId: undefined,
      selectedObjectTypeId: undefined,
    }))
  }

  const selectRow = (id: string) => {
    const row = setup?.rows.find((candidate) => candidate.id === id)
    updateProjectState((state) => ({
      ...state,
      activeScope: `track:${id}`,
      selectedAreaId: row?.zoneId ?? state.selectedAreaId,
      selectedTrackId: id,
      selectedObjectTypeId: undefined,
    }))
  }

  const selectItem = (code: string) => {
    updateProjectState((state) => ({
      ...state,
      activeScope: `object:${code}`,
      selectedObjectTypeId: code,
    }))
  }
</script>

{#if !setup || !projectState}
  <section class="map-studio-shell map-studio-shell--loading">
    <div><strong>Setup mappa non caricato</strong><span>{status}</span></div>
    <button type="button" onclick={onReload}>Ricarica setup</button>
  </section>
{:else}
  <MapStudioShell
    {setup}
    {output}
    {status}
    {projectState}
    {distanceRows}
    {draftAvailable}
    {disabledLayers}
    onDomainChange={changeDomain}
    onLayerToggle={toggleLayer}
    onSelectedZoneChange={selectZone}
    onSelectedRowChange={selectRow}
    onSelectedItemChange={selectItem}
    {onSave}
    {onCalculate}
    {onShowDraft}
    {onUpdateDistance}
  />
{/if}
