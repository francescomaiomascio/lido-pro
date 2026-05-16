<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import MapStudioLayerBar from './MapStudioLayerBar.svelte'
  import ParametricBoard from './board/ParametricBoard.svelte'
  import type { MapStudioLayerId } from './mapStudioLayers'
  import type { MapStudioControlPlane } from './state/mapStudioControlPlane'
  import type { MapStudioScopeId } from './state/mapStudioScope'

  let {
    setup,
    output = null,
    projectState,
    controlPlane,
    disabledLayers = [],
    onLayerToggle,
    onScopeChange,
    onScopeHover,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    projectState: MapStudioProjectState
    controlPlane: MapStudioControlPlane
    disabledLayers?: MapStudioLayerId[]
    onLayerToggle: (layer: MapStudioLayerId) => void
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onScopeHover: (scopeId?: MapStudioScopeId) => void
  } = $props()
</script>

<section class="map-studio-board-host" aria-label="Tavola parametrica">
  <MapStudioLayerBar activeLayerSet={projectState.activeLayerSet} {disabledLayers} {onLayerToggle} />
  <div class="map-studio-board-host__stage">
    <ParametricBoard
      {setup}
      {output}
      {projectState}
      emphasis={controlPlane.boardEmphasis}
      onScopeChange={onScopeChange}
      onScopeHover={onScopeHover}
    />
  </div>
</section>
