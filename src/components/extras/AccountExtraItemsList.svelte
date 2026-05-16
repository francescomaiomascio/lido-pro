<script lang="ts">
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { AccountExtraItem } from '../../lib/types/extraItem'

  let {
    items,
    saving,
    onRemove,
  }: {
    items: AccountExtraItem[]
    saving: boolean
    onRemove: (id: string) => void | Promise<void>
  } = $props()
</script>

<div class="extra-list">
  {#if items.length === 0}
    <p class="empty-customer">Nessun extra aggiunto.</p>
  {:else}
    {#each items as item}
      <article>
        <div>
          <strong>{item.name}</strong>
          <span>{item.quantity} x {formatEuroFromCents(item.unitAmountCents)}</span>
        </div>
        <div>
          <strong>{formatEuroFromCents(item.totalAmountCents)}</strong>
          <button type="button" disabled={saving} onclick={() => onRemove(item.id)}>Rimuovi</button>
        </div>
      </article>
    {/each}
  {/if}
</div>
