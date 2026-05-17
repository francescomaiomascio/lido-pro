<script lang="ts">
  import { canvasStudioTools, type MapCanvasStudioToolId } from '../../lib/map-canvas'
  import CanvasStudioToolButton from './CanvasStudioToolButton.svelte'

  let {
    activeToolId,
    onClose,
    onSelectTool,
  }: {
    activeToolId: MapCanvasStudioToolId | null
    onClose: () => void
    onSelectTool: (toolId: MapCanvasStudioToolId) => void
  } = $props()
</script>

<aside class="canvas-studio-rail" aria-label="Canvas Studio">
  <button type="button" class="canvas-studio-rail__close" aria-label="Chiudi Canvas Studio" onclick={onClose}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M18 6 6 18"></path>
      <path d="m6 6 12 12"></path>
    </svg>
  </button>
  <div class="canvas-studio-rail__tools">
    {#each canvasStudioTools as tool}
      <CanvasStudioToolButton
        {tool}
        active={tool.id === activeToolId}
        onSelect={() => onSelectTool(tool.id)}
      />
    {/each}
  </div>
</aside>
