<script lang="ts">
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { AccountExtraItem, TariffIncludedItem } from '../../lib/types/extraItem'
  import type { Snippet } from 'svelte'

  let {
    includedItems,
    paidExtras,
    canEdit,
    editing,
    onEdit,
    children,
  }: {
    includedItems: TariffIncludedItem[]
    paidExtras: AccountExtraItem[]
    canEdit: boolean
    editing: boolean
    onEdit: () => void
    children?: Snippet
  } = $props()

  const paidTotal = $derived(paidExtras.reduce((total, item) => total + item.totalAmountCents, 0))
</script>

<section class="booking-block" class:booking-block--editing={editing} aria-label="Dotazioni">
  <div class="booking-block__head">
    <div>
      <span>Dotazioni</span>
      <div class="booking-chip-row" aria-label="Dotazioni incluse">
        {#if includedItems.length}
          {#each includedItems as item}
            <em>{item.quantity} {item.name.toLowerCase()}</em>
          {/each}
        {:else}
          <small>Nessuna dotazione inclusa</small>
        {/if}
      </div>
      <small>
        Extra:
        {#if paidExtras.length}
          {paidExtras.map((item) => `${item.name} x${item.quantity}`).join(' · ')} · {formatEuroFromCents(paidTotal)}
        {:else}
          nessun extra a pagamento
        {/if}
      </small>
    </div>
    {#if !editing && canEdit}
      <button type="button" onclick={onEdit}>Modifica extra</button>
    {/if}
  </div>
  {#if editing}
    <div class="booking-block__editor">
      {@render children?.()}
    </div>
  {/if}
</section>
