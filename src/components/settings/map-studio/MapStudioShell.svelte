<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import type { MapStudioDomainId } from './mapStudioDomains'
  import MapStudioTopBar from './MapStudioTopBar.svelte'
  import MapStudioDomainTabs from './MapStudioDomainTabs.svelte'
  import MapStudioParametricBoardHost from './MapStudioParametricBoardHost.svelte'
  import MapStudioContextDock from './MapStudioContextDock.svelte'
  import type { MapStudioLayerId } from './mapStudioLayers'
  import type { MapStudioAction } from './state/mapStudioActions'
  import type { MapStudioControlPlane } from './state/mapStudioControlPlane'
  import type { MapStudioScopeId } from './state/mapStudioScope'

  let {
    setup,
    output = null,
    status,
    projectState,
    controlPlane,
    draftAvailable,
    disabledLayers,
    onDomainChange,
    onLayerToggle,
    onScopeChange,
    onScopeHover,
    onClearScope,
    onAction,
    onSave,
    onCalculate,
    onShowDraft,
    onUpdateDistance,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    status: string
    projectState: MapStudioProjectState
    controlPlane: MapStudioControlPlane
    draftAvailable: boolean
    disabledLayers: MapStudioLayerId[]
    onDomainChange: (domain: MapStudioDomainId) => void
    onLayerToggle: (layer: MapStudioLayerId) => void
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onScopeHover: (scopeId?: MapStudioScopeId) => void
    onClearScope: () => void
    onAction: (action: MapStudioAction) => void
    onSave: () => void
    onCalculate: () => void
    onShowDraft: () => void
    onUpdateDistance: <K extends keyof ParametricSetupState['distanceRules']>(key: K, value: ParametricSetupState['distanceRules'][K]) => void
  } = $props()
</script>

<section class="map-studio-shell" aria-label="Studio mappa">
  <MapStudioTopBar {setup} {output} {status} {draftAvailable} {projectState} {onSave} {onCalculate} {onShowDraft} />
  <MapStudioDomainTabs activeDomain={projectState.activeDomain} onDomainChange={onDomainChange} />
  <div class="map-studio-workspace">
    <MapStudioParametricBoardHost
      {setup}
      {output}
      {projectState}
      {controlPlane}
      {disabledLayers}
      {onLayerToggle}
      {onScopeChange}
      {onScopeHover}
    />
  </div>
  <MapStudioContextDock
    {setup}
    {projectState}
    {controlPlane}
    {onScopeChange}
    {onClearScope}
    {onAction}
    {onUpdateDistance}
  />
</section>
