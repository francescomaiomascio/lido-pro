<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import type { MapStudioDomainId } from './mapStudioDomains'
  import type { MapStudioLayerId } from './mapStudioLayers'
  import MapStudioTopBar from './MapStudioTopBar.svelte'
  import MapStudioDomainTabs from './MapStudioDomainTabs.svelte'
  import MapStudioParametricBoardHost from './MapStudioParametricBoardHost.svelte'
  import MapStudioContextDock from './MapStudioContextDock.svelte'
  import type { MapStudioAction, MapStudioToolId } from './state/mapStudioActions'
  import type { MapStudioControlPlane } from './state/mapStudioControlPlane'
  import type { MapStudioLifecycleModel } from './state/mapStudioLifecycle'
  import type { MapStudioSelectedHandle } from './state/mapStudioManipulation'
  import type { MapStudioScopeId } from './state/mapStudioScope'

  let {
    setup,
    output = null,
    status,
    projectState,
    controlPlane,
    lifecycle,
    draftAvailable,
    onDomainChange,
    onLayerToggle,
    onToolChange,
    onScopeChange,
    onScopeHover,
    onManipulationStart,
    onManipulationUpdate,
    onManipulationFinish,
    onClearScope,
    onAction,
    onSave,
    onCalculate,
    onShowDraft,
    onUpdateDistance,
    onExitProject,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    status: string
    projectState: MapStudioProjectState
    controlPlane: MapStudioControlPlane
    lifecycle: MapStudioLifecycleModel
    draftAvailable: boolean
    onDomainChange: (domain: MapStudioDomainId) => void
    onLayerToggle: (layer: MapStudioLayerId) => void
    onToolChange: (tool: MapStudioToolId) => void
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onScopeHover: (scopeId?: MapStudioScopeId) => void
    onManipulationStart: (handle: MapStudioSelectedHandle, previewOnly?: boolean) => void
    onManipulationUpdate: (handle: MapStudioSelectedHandle) => void
    onManipulationFinish: () => void
    onClearScope: () => void
    onAction: (action: MapStudioAction) => void
    onSave: () => void
    onCalculate: () => void
    onShowDraft: () => void
    onUpdateDistance: <K extends keyof ParametricSetupState['distanceRules']>(key: K, value: ParametricSetupState['distanceRules'][K]) => void
    onExitProject: () => void
  } = $props()
</script>

<section class="map-studio-shell" aria-label="Studio mappa">
  <MapStudioTopBar {setup} {output} {status} {draftAvailable} {projectState} {lifecycle} {onSave} {onCalculate} {onShowDraft} {onExitProject} />
  <MapStudioDomainTabs activeDomain={projectState.activeDomain} domainStates={lifecycle.domainStates} onDomainChange={onDomainChange} />
  <div class="map-studio-workspace">
    <MapStudioParametricBoardHost
      {setup}
      {output}
      {projectState}
      {controlPlane}
      {lifecycle}
      {draftAvailable}
      {onLayerToggle}
      {onToolChange}
      {onScopeChange}
      {onScopeHover}
      {onManipulationStart}
      {onManipulationUpdate}
      {onManipulationFinish}
    />
  </div>
  <MapStudioContextDock
    {setup}
    {projectState}
    {controlPlane}
    {lifecycle}
    {onScopeChange}
    {onClearScope}
    {onAction}
  />
</section>
