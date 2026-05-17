<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import MapStudioOperationRail from './MapStudioOperationRail.svelte'
  import MapStudioViewRail from './MapStudioViewRail.svelte'
  import ParametricBoard from './board/ParametricBoard.svelte'
  import type { MapStudioLayerId } from './mapStudioLayers'
  import type { MapStudioLifecycleModel } from './state/mapStudioLifecycle'
  import type { MapStudioSelectedHandle } from './state/mapStudioManipulation'
  import type { MapStudioToolId } from './state/mapStudioActions'
  import type { MapStudioControlPlane } from './state/mapStudioControlPlane'
  import type { MapStudioScopeId } from './state/mapStudioScope'

  let {
    setup,
    output = null,
    projectState,
    controlPlane,
    lifecycle,
    draftAvailable,
    onLayerToggle,
    onToolChange,
    onScopeChange,
    onScopeHover,
    onManipulationStart,
    onManipulationUpdate,
    onManipulationFinish,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    projectState: MapStudioProjectState
    controlPlane: MapStudioControlPlane
    lifecycle: MapStudioLifecycleModel
    draftAvailable: boolean
    onLayerToggle: (layer: MapStudioLayerId) => void
    onToolChange: (tool: MapStudioToolId) => void
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onScopeHover: (scopeId?: MapStudioScopeId) => void
    onManipulationStart: (handle: MapStudioSelectedHandle, previewOnly?: boolean) => void
    onManipulationUpdate: (handle: MapStudioSelectedHandle) => void
    onManipulationFinish: () => void
  } = $props()
</script>

<section class="map-studio-board-host" aria-label="Tavola parametrica">
  <div class="map-studio-board-host__stage">
    <ParametricBoard
      {setup}
      {output}
      {projectState}
      emphasis={controlPlane.boardEmphasis}
      onScopeChange={onScopeChange}
      onScopeHover={onScopeHover}
      onManipulationStart={onManipulationStart}
      onManipulationUpdate={onManipulationUpdate}
      onManipulationFinish={onManipulationFinish}
    />
  </div>
  <MapStudioViewRail activeLayerSet={projectState.activeLayerSet} layers={lifecycle.layerControls} {onLayerToggle} />
  <MapStudioOperationRail
    activeTool={projectState.activeTool}
    tools={lifecycle.toolControls}
    {draftAvailable}
    {onToolChange}
  />
</section>
