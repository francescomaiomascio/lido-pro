<script lang="ts">
  import type { ElementActionPlacementResult } from '../../lib/map-canvas'
  import type { BeachItem } from '../../lib/types/beach'

  let {
    item,
    displayCode = '',
    placement,
    onCenter,
    onOpenPanel,
    onClose,
  }: {
    item: BeachItem | null
    displayCode?: string
    placement: ElementActionPlacementResult | null
    onCenter: () => void
    onOpenPanel: () => void
    onClose: () => void
  } = $props()

  const panelStyle = $derived(
    placement
      ? `left: ${placement.xPx}px; top: ${placement.yPx}px; transform-origin: ${placement.transformOrigin};`
      : '',
  )
</script>

{#if item && placement}
  <aside
    class="selected-element-action-panel"
    class:selected-element-action-panel--docked={placement.docked}
    data-placement={placement.placement}
    style={panelStyle}
    aria-label={`Azioni ${displayCode || item.code}`}
  >
    <button
      class="selected-element-action-panel__identity"
      type="button"
      aria-label={`Apri dettagli ${displayCode || item.code}`}
      title="Apri dettagli"
      onclick={onOpenPanel}
    >
      {displayCode || item.code}
    </button>

    <span class="selected-element-action-panel__divider" aria-hidden="true"></span>

    <button class="selected-element-action-panel__action" type="button" aria-label="Centra elemento" title="Centra" onclick={onCenter}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M12 2v4"></path>
        <path d="M12 18v4"></path>
        <path d="M2 12h4"></path>
        <path d="M18 12h4"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    </button>

    <button class="selected-element-action-panel__action" type="button" aria-label="Scheda operativa" title="Scheda operativa" onclick={onOpenPanel}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M5 4h14v16H5z"></path>
        <path d="M8 9h8"></path>
        <path d="M8 13h5"></path>
      </svg>
    </button>

    <button class="selected-element-action-panel__action selected-element-action-panel__action--close" type="button" aria-label="Chiudi azioni" title="Chiudi" onclick={onClose}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M18 6 6 18"></path>
        <path d="m6 6 12 12"></path>
      </svg>
    </button>
  </aside>
{/if}
