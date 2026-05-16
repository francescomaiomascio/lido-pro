<script lang="ts">
  import { mapCanvasTools, type MapCanvasToolId } from '../../lib/map-canvas'

  let {
    activeToolId,
    onSelectTool,
    onClose,
  }: {
    activeToolId: MapCanvasToolId
    onSelectTool: (toolId: MapCanvasToolId) => void
    onClose: () => void
  } = $props()

  const activeTools = $derived(mapCanvasTools.filter((tool) => !tool.planned))
  const plannedTools = $derived(mapCanvasTools.filter((tool) => tool.planned))
</script>

<aside class="map-magic-tools-panel" aria-label="Strumenti mappa">
  <header class="map-tools-drawer__header">
    <div>
      <h2>Strumenti mappa</h2>
      <p>Operazioni Canvas e modifica layout</p>
    </div>
    <button type="button" aria-label="Chiudi strumenti mappa" onclick={onClose}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M18 6 6 18"></path>
        <path d="m6 6 12 12"></path>
      </svg>
    </button>
  </header>

  <section class="map-tools-drawer__section" aria-label="Tool attivi">
    <strong>Attivi</strong>
    <div class="map-tools-list map-tools-list--active">
      {#each activeTools as tool}
        <button
          type="button"
          class="map-tool-row"
          class:active={tool.id === activeToolId}
          onclick={() => onSelectTool(tool.id)}
        >
          <span class="map-tool-row__state" aria-hidden="true"></span>
          <span class="map-tool-row__copy">
            <span>{tool.label}</span>
            <small>{tool.description}</small>
          </span>
        </button>
      {/each}
    </div>
  </section>

  <section class="map-tools-drawer__section" aria-label="Tool previsti">
    <strong>Previsti</strong>
    <div class="map-tools-list map-tools-list--planned">
      {#each plannedTools as tool}
        <button type="button" class="map-tool-row" disabled>
          <span class="map-tool-row__state" aria-hidden="true"></span>
          <span class="map-tool-row__copy">
            <span>{tool.label}</span>
            <small>{tool.description}</small>
          </span>
          <em>Previsto</em>
        </button>
      {/each}
    </div>
  </section>
</aside>
