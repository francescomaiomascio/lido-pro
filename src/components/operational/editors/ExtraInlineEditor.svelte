<script lang="ts">
  import { formatEuroFromCents, parseEuroToCents } from '../../../lib/format/money'
  import IncludedEquipmentSummary from '../IncludedEquipmentSummary.svelte'
  import type { Account } from '../../../lib/types/account'
  import type { AccountExtraItem, AccountExtraItemInput, ExtraItemCatalogEntry, TariffIncludedItem } from '../../../lib/types/extraItem'

  let { account, catalog, items, includedItems, saving, onAdd, onRemove, onClose }: {
    account: Account
    catalog: ExtraItemCatalogEntry[]
    items: AccountExtraItem[]
    includedItems: TariffIncludedItem[]
    saving: boolean
    onAdd: (accountId: string, input: AccountExtraItemInput) => void | Promise<void>
    onRemove: (id: string) => void | Promise<void>
    onClose: () => void
  } = $props()
  let quantityById: Record<string, number> = $state({})
  let amountById: Record<string, string> = $state({})
  let errorById: Record<string, string> = $state({})
  const getQuantity = (id: string) => quantityById[id] ?? 1
  const getAmount = (entry: ExtraItemCatalogEntry) =>
    amountById[entry.id] ?? formatEuroFromCents(entry.defaultAmountCents).replace('€', '').trim()
  const addCatalogItem = async (entry: ExtraItemCatalogEntry) => {
    const quantity = getQuantity(entry.id)
    if (quantity > entry.maxQuantityPerBooking) {
      errorById = {
        ...errorById,
        [entry.id]: `Quantita massima: ${entry.maxQuantityPerBooking}.`,
      }
      return
    }
    errorById = { ...errorById, [entry.id]: '' }
    await onAdd(account.id, {
      catalogItemId: entry.id,
      name: entry.name,
      quantity,
      unitAmountCents: parseEuroToCents(getAmount(entry)),
    })
  }
</script>

<section class="inline-editor" aria-label="Articoli extra">
  <header class="inline-editor__header">
    <div><strong>Gestisci Articoli extra</strong><span>Catalogo Articoli, prezzo unitario e quantita massima.</span></div>
    <button type="button" onclick={onClose}>Chiudi</button>
  </header>
  <IncludedEquipmentSummary items={includedItems} />
  <div class="inline-editor__subhead">Articoli disponibili</div>
  <div class="inline-editor__results">
    {#each catalog.filter((entry) => entry.active) as entry}
      <div class="inline-editor__result-row inline-editor__result-row--extra">
        <strong>{entry.name}</strong>
        <small>{formatEuroFromCents(entry.defaultAmountCents)} · max {entry.maxQuantityPerBooking}</small>
        <input type="number" min="1" max={entry.maxQuantityPerBooking} value={getQuantity(entry.id)} oninput={(event) => (quantityById[entry.id] = Number(event.currentTarget.value))} />
        <input value={getAmount(entry)} inputmode="decimal" oninput={(event) => (amountById[entry.id] = event.currentTarget.value)} />
        <button
          type="button"
          aria-label={`Aggiungi ${entry.name}`}
          title={`Aggiungi ${entry.name}`}
          disabled={saving}
          onclick={() => addCatalogItem(entry)}
        >+</button>
        {#if errorById[entry.id]}
          <em>{errorById[entry.id]}</em>
        {/if}
      </div>
    {/each}
  </div>
  {#if items.length}
    <div class="inline-editor__linked">
      {#each items as item}
        <span>{item.name} x{item.quantity} <button type="button" disabled={saving} onclick={() => onRemove(item.id)}>Rimuovi</button></span>
      {/each}
    </div>
  {/if}
</section>
