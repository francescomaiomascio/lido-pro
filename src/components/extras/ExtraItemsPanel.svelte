<script lang="ts">
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { Account } from '../../lib/types/account'
  import type {
    AccountExtraItem,
    AccountExtraItemInput,
    ExtraItemCatalogEntry,
  } from '../../lib/types/extraItem'
  import AccountExtraItemsList from './AccountExtraItemsList.svelte'
  import ExtraItemForm from './ExtraItemForm.svelte'

  let {
    account,
    catalog,
    items,
    saving,
    onAdd,
    onRemove,
  }: {
    account: Account | null
    catalog: ExtraItemCatalogEntry[]
    items: AccountExtraItem[]
    saving: boolean
    onAdd: (accountId: string, input: AccountExtraItemInput) => void | Promise<void>
    onRemove: (id: string) => void | Promise<void>
  } = $props()

  const extraTotal = $derived(items.reduce((total, item) => total + item.totalAmountCents, 0))
</script>

<section class="extras-panel" aria-label="Extra">
  <div class="section-heading">
    <h3>Articoli extra</h3>
    <span>Totale extra {formatEuroFromCents(extraTotal)}</span>
  </div>

  {#if !account}
    <p class="empty-customer">Apri prima un conto per aggiungere lettini, sdraio o sedie.</p>
  {:else}
    <div class="extra-catalog-grid">
      {#each catalog as entry}
        <ExtraItemForm
          {entry}
          {saving}
          onAdd={(quantity, unitAmountCents) =>
            onAdd(account.id, {
              catalogItemId: entry.id,
              name: entry.name,
              quantity,
              unitAmountCents,
            })}
        />
      {/each}
    </div>

    <AccountExtraItemsList {items} {saving} {onRemove} />
  {/if}
</section>
