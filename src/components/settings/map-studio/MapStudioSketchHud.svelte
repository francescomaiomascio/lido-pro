<script lang="ts">
  import type { SketchDisplayId, SketchDisplayState } from './state/sketchDisplay'

  let {
    display,
    onToggle,
  }: {
    display: SketchDisplayState
    onToggle: (displayId: SketchDisplayId) => void
  } = $props()

  const controls: Array<{ id: SketchDisplayId; label: string }> = [
    { id: 'grid', label: 'Grid' },
    { id: 'dimensions', label: 'Quote' },
    { id: 'guides', label: 'Guide' },
    { id: 'areas', label: 'Aree' },
    { id: 'tracks', label: 'File' },
    { id: 'footprints', label: 'Ingombri' },
    { id: 'constraints', label: 'Vincoli' },
    { id: 'warnings', label: 'Warning' },
    { id: 'preview', label: 'Preview' },
  ]
</script>

<div class="map-sketch-display-hud" aria-label="Display viewport">
  <span>Display</span>
  <div>
    {#each controls as control}
      <button
        type="button"
        class:active={display[control.id]}
        aria-pressed={display[control.id]}
        onclick={() => onToggle(control.id)}
      >
        {control.label}
      </button>
    {/each}
  </div>
</div>
