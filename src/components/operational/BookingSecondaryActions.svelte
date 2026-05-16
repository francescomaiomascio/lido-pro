<script lang="ts">
  let {
    technicalOpen,
    itemId,
    layoutId,
    coordinates,
    size,
    onClose,
  }: {
    technicalOpen: boolean
    itemId: string
    layoutId: string
    coordinates: string
    size: string
    onClose: () => void
  } = $props()
</script>

{#if technicalOpen}
  <aside class="booking-technical-popover" aria-label="Informazioni tecniche">
    <header>
      <strong>Info tecnico</strong>
      <button type="button" aria-label="Chiudi info tecnico" onclick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
    </header>
    <div><span>ID posto</span><code>{itemId}</code></div>
    <div><span>Layout</span><code>{layoutId}</code></div>
    <div><span>Coordinate</span><code>{coordinates}</code></div>
    <div><span>Dimensioni</span><code>{size}</code></div>
  </aside>
{/if}
