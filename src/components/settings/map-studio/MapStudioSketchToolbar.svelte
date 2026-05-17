<script lang="ts">
  import type { MapStudioLifecycleModel } from './state/mapStudioLifecycle'
  import {
    getSketchCommand,
    sketchCommandGroups,
    type SketchCommandId,
  } from './state/sketchTools'

  let {
    activeCommand,
    lifecycle,
    onCommandChange,
  }: {
    activeCommand: SketchCommandId
    lifecycle: MapStudioLifecycleModel
    onCommandChange: (command: SketchCommandId) => void
  } = $props()

  const disabledReasonForCommand = (commandId: SketchCommandId) => {
    if (commandId === 'area' && !lifecycle.completeness.hasPerimeter) return 'Definisci prima il perimetro.'
    if (commandId === 'track' && !lifecycle.completeness.hasFunctionalAreas) return 'Definisci prima le aree.'
    if (commandId === 'footprint' && !lifecycle.completeness.hasTracks) return 'Definisci prima i tracciati.'
    if (commandId === 'constraint' && !lifecycle.completeness.hasObjectParameters) return 'Definisci prima gli ingombri.'
    if (commandId === 'verify' && !lifecycle.completeness.canVerify) return 'Completa il modello prima della verifica.'
    if (commandId === 'preview' && !lifecycle.completeness.previewReady) return 'Anteprima non ancora disponibile.'
    return undefined
  }

  const iconPath = (commandId: SketchCommandId) => {
    if (commandId === 'select') return 'M5 4l7 16 2-7 6-2L5 4Z'
    if (commandId === 'pan') return 'M8 12V7a2 2 0 0 1 4 0v4M12 11V5a2 2 0 1 1 4 0v8M16 12V8a2 2 0 0 1 4 0v5a7 7 0 0 1-14 0v-2'
    if (commandId === 'fit') return 'M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3'
    if (commandId === 'measure') return 'M4 20 20 4M7 17l-2-2M11 13l-2-2M15 9l-2-2M19 5l-2-2'
    if (commandId === 'perimeter') return 'M4 5h16v14H4zM8 5v14M4 10h16'
    if (commandId === 'seaEdge') return 'M3 9c3-4 6 4 9 0s6 4 9 0M5 15h14'
    if (commandId === 'margin') return 'M6 6h12v12H6zM3 3h18v18H3z'
    if (commandId === 'area') return 'M4 6h16M4 12h16M4 18h16'
    if (commandId === 'track') return 'M5 7h14M7 12h10M5 17h14'
    if (commandId === 'footprint') return 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'
    if (commandId === 'constraint') return 'M5 12h14M7 9v6M17 9v6M8 5h8M8 19h8'
    if (commandId === 'verify') return 'M20 6 9 17l-5-5'
    return 'M5 4h14v12H9l-4 4V4z'
  }
</script>

<nav class="map-sketch-toolbar" aria-label="Comandi sketch">
  {#each sketchCommandGroups as group}
    <section class="map-sketch-toolbar__group" aria-label={group.label}>
      <span>{group.label}</span>
      {#each group.commandIds as commandId}
        {@const command = getSketchCommand(commandId)}
        {@const disabledReason = disabledReasonForCommand(commandId)}
        <button
          type="button"
          class:active={activeCommand === command.id}
          disabled={Boolean(disabledReason)}
          title={disabledReason ?? command.prompt}
          aria-label={command.label}
          onclick={() => onCommandChange(command.id)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d={iconPath(command.id)} />
          </svg>
          <em>{command.shortLabel}</em>
        </button>
      {/each}
    </section>
  {/each}
</nav>
