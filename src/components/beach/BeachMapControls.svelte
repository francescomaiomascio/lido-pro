<script lang="ts">
  let {
    onZoomIn,
    onZoomOut,
    onFit,
    onReset,
  }: {
    onZoomIn: () => void
    onZoomOut: () => void
    onFit: () => void
    onReset: () => void
  } = $props()
</script>

<div class="map-controls" aria-label="Controlli vista mappa">
  <button type="button" aria-label="Riduci zoom" onclick={onZoomOut}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M5 12h14"></path>
    </svg>
  </button>
  <button type="button" aria-label="Aumenta zoom" onclick={onZoomIn}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 5v14"></path>
      <path d="M5 12h14"></path>
    </svg>
  </button>
  <button type="button" aria-label="Adatta mappa alla vista" onclick={onFit}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
      <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
      <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
      <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
    </svg>
  </button>
  <button type="button" aria-label="Reimposta vista mappa" onclick={onReset}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7"></path>
      <path d="M3 4v6h6"></path>
    </svg>
  </button>
</div>
