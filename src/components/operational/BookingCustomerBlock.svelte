<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    customerName,
    editing,
    disabled = false,
    onEdit,
    onRemove,
    children,
  }: {
    customerName: string | null
    editing: boolean
    disabled?: boolean
    onEdit: () => void
    onRemove: () => void | Promise<void>
    children?: Snippet
  } = $props()
</script>

<section class="booking-block" class:booking-block--editing={editing} aria-label="Cliente">
  <div class="booking-block__head">
    <div>
      <span>Cliente</span>
      <strong>{customerName ?? 'Nessun cliente assegnato'}</strong>
    </div>
    {#if !editing}
      <div class="booking-block__actions">
        <button type="button" disabled={disabled} onclick={onEdit}>{customerName ? 'Cambia' : 'Assegna'}</button>
        {#if customerName}
          <button type="button" class="booking-action-muted" disabled={disabled} onclick={onRemove}>Rimuovi</button>
        {/if}
      </div>
    {/if}
  </div>
  {#if editing}
    <div class="booking-block__editor">
      {@render children?.()}
    </div>
  {/if}
</section>
