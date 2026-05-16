<script lang="ts">
  import { mapStudioLayers, type MapStudioLayerId } from './mapStudioLayers'

  let {
    activeLayerSet,
    disabledLayers = [],
    onLayerToggle,
  }: {
    activeLayerSet: MapStudioLayerId[]
    disabledLayers?: MapStudioLayerId[]
    onLayerToggle: (layer: MapStudioLayerId) => void
  } = $props()
</script>

<div class="map-studio-layer-bar" aria-label="Layer tavola">
  {#each mapStudioLayers.filter((layer) => layer.visibleInBar !== false) as layer}
    <button
      type="button"
      class:active={activeLayerSet.includes(layer.id)}
      disabled={disabledLayers.includes(layer.id)}
      title={layer.description}
      onclick={() => onLayerToggle(layer.id)}
    >
      {layer.label}
    </button>
  {/each}
</div>
