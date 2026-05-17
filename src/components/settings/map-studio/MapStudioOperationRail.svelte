<script lang="ts">
  import type { MapStudioToolId } from './state/mapStudioActions'
  import type { MapStudioToolControl } from './state/mapStudioLifecycle'

  let {
    activeTool,
    tools,
    draftAvailable,
    onToolChange,
  }: {
    activeTool: MapStudioToolId
    tools: MapStudioToolControl[]
    draftAvailable: boolean
    onToolChange: (tool: MapStudioToolId) => void
  } = $props()

  let expanded = $state(true)
  const disabledReason = (tool: MapStudioToolControl) => {
    if (tool.disabledReason) return tool.disabledReason
    if (tool.id === 'preview' && !draftAvailable) {
      return "Genera un'anteprima prima di usare questo strumento."
    }
    return ''
  }
</script>

<aside class="map-studio-operation-rail map-studio-floating-palette" class:collapsed={!expanded} aria-label="Strumenti operativi Studio mappa">
  <header>
    <button
      type="button"
      class="map-studio-floating-palette__toggle"
      aria-expanded={expanded}
      onclick={() => (expanded = !expanded)}
    >
      <span>TOOLS</span>
      <strong>Operazioni</strong>
    </button>
  </header>
  {#if expanded}
    <div class="map-studio-operation-rail__list">
      {#each tools as tool}
        {@const reason = disabledReason(tool)}
        <button
          type="button"
          class:active={tool.id === activeTool}
          disabled={Boolean(reason)}
          title={reason || tool.description}
          onclick={() => onToolChange(tool.id)}
        >
          <strong>{tool.label}</strong>
          <span>{tool.shortLabel}</span>
        </button>
      {/each}
    </div>
  {/if}
</aside>
