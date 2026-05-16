<script lang="ts">
  import type { MapCanvasStudioToolDefinition } from '../../lib/map-canvas'

  let {
    tool,
    active,
    onSelect,
  }: {
    tool: MapCanvasStudioToolDefinition
    active: boolean
    onSelect: () => void
  } = $props()
</script>

<button
  type="button"
  class="canvas-studio-tool"
  class:active
  class:planned={tool.planned}
  aria-label={tool.label}
  aria-pressed={active}
  disabled={!tool.enabled}
  onclick={onSelect}
>
  <span class="canvas-studio-tool__icon" aria-hidden="true">
    {#if tool.id === 'surface'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 15c3-4 6 4 9 0s6 4 9 0"></path>
        <path d="M4 9c3-3 5 3 8 0s5 3 8 0"></path>
      </svg>
    {:else if tool.id === 'grid'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16v16H4z"></path>
        <path d="M4 10h16M4 16h16M10 4v16M16 4v16"></path>
      </svg>
    {:else if tool.id === 'rendering'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="8" r="3"></circle>
        <path d="M12 11v9M7 15h10"></path>
      </svg>
    {:else if tool.id === 'assets'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z"></path>
      </svg>
    {:else if tool.id === 'umbrellas'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 12a8 8 0 0 1 16 0Z"></path>
        <path d="M12 12v8"></path>
      </svg>
    {:else if tool.id === 'palms'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 21v-8"></path>
        <path d="M12 13c-4-1-6-4-7-8 4 0 6 2 7 5"></path>
        <path d="M12 13c4-1 6-4 7-8-4 0-6 2-7 5"></path>
      </svg>
    {:else if tool.id === 'zones'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 5h8v6H4zM12 13h8v6h-8z"></path>
        <path d="M15 5h5v5"></path>
      </svg>
    {:else if tool.id === 'walkways'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 19 19 5"></path>
        <path d="m7 13 4 4M11 9l4 4M15 5l4 4"></path>
      </svg>
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6 9 17l-5-5"></path>
      </svg>
    {/if}
  </span>
  <span class="canvas-studio-tool__label">{tool.shortLabel}</span>
</button>
