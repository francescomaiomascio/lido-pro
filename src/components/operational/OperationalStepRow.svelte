<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { OperationalRow } from '../../lib/operational/operationalRows'

  let { row, expanded, onAction, children }: {
    row: OperationalRow
    expanded: boolean
    onAction: () => void
    children?: Snippet
  } = $props()
</script>

<section class="operational-step-row" class:operational-step-row--active={expanded} class:operational-step-row--secondary={row.secondary}>
  <div class="operational-step-row__main">
    <strong>{row.label}</strong>
    <span>{row.value}</span>
    <button type="button" disabled={!row.enabled} title={!row.enabled ? row.disabledReason : undefined} onclick={onAction}>
      {expanded ? 'Chiudi' : row.actionLabel}
    </button>
  </div>
  {#if expanded && children}
    <div class="operational-step-row__editor">
      {@render children()}
    </div>
  {/if}
</section>
