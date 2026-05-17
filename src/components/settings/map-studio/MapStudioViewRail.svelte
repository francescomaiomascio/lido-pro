<script lang="ts">
  import type { MapStudioLayerId } from './mapStudioLayers'
  import type { MapStudioLayerControl } from './state/mapStudioLifecycle'

  let {
    activeLayerSet,
    layers,
    onLayerToggle,
  }: {
    activeLayerSet: MapStudioLayerId[]
    layers: MapStudioLayerControl[]
    onLayerToggle: (layer: MapStudioLayerId) => void
  } = $props()

  let expanded = $state(true)
</script>

<aside class="map-studio-view-rail map-studio-floating-palette" class:collapsed={!expanded} aria-label="Controlli vista e layer">
  <header>
    <button
      type="button"
      class="map-studio-floating-palette__toggle"
      aria-expanded={expanded}
      onclick={() => (expanded = !expanded)}
    >
      <span>VIEW</span>
      <strong>Layer</strong>
    </button>
  </header>
  {#if expanded}
    <div class="map-studio-view-rail__list">
      {#each layers as layer}
        <button
          type="button"
          class:active={activeLayerSet.includes(layer.id)}
          disabled={Boolean(layer.disabledReason)}
          title={layer.disabledReason ? `${layer.label}: ${layer.disabledReason}` : layer.description}
          onclick={() => onLayerToggle(layer.id)}
        >
          <span aria-hidden="true">{activeLayerSet.includes(layer.id) ? '✓' : ''}</span>
          <strong>{layer.label}</strong>
        </button>
      {/each}
    </div>
  {/if}
</aside>
