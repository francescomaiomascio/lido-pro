<script lang="ts">
  import { canvasStudioTools, type MapCanvasStudioToolId } from '../../lib/map-canvas'
  import CanvasStudioToolButton from './CanvasStudioToolButton.svelte'

  let {
    activeToolId,
    onSelectTool,
  }: {
    activeToolId: MapCanvasStudioToolId | null
    onSelectTool: (toolId: MapCanvasStudioToolId) => void
  } = $props()
</script>

<aside class="canvas-studio-rail" aria-label="Canvas Studio">
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
