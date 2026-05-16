<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    periodLabel,
    helper,
    canEdit,
    hasReservation,
    editing,
    onEdit,
    children,
  }: {
    periodLabel: string
    helper?: string
    canEdit: boolean
    hasReservation: boolean
    editing: boolean
    onEdit: () => void
    children?: Snippet
  } = $props()
</script>

<section class="booking-block" class:booking-block--editing={editing} aria-label="Periodo">
  <div class="booking-block__head">
    <div>
      <span>Periodo</span>
      <strong>{periodLabel}</strong>
      {#if helper}<small>{helper}</small>{/if}
    </div>
    {#if !editing && canEdit}
      <button type="button" onclick={onEdit}>{hasReservation ? 'Modifica' : 'Imposta periodo'}</button>
    {/if}
  </div>
  {#if editing}
    <div class="booking-block__editor">
      {@render children?.()}
    </div>
  {/if}
</section>
