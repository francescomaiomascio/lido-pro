<script lang="ts">
  import { formatEuroFromCents, parseEuroToCents } from '../../lib/format/money'
  import type { ExtraItemCatalogEntry } from '../../lib/types/extraItem'

  let {
    entry,
    saving,
    onAdd,
  }: {
    entry: ExtraItemCatalogEntry
    saving: boolean
    onAdd: (quantity: number, unitAmountCents: number) => void | Promise<void>
  } = $props()

  let quantity = $state(1)
  let amount = $state('')

  $effect(() => {
    amount = formatEuroFromCents(entry.defaultAmountCents).replace('€', '').trim()
  })
</script>

<form
  class="extra-item-form"
  onsubmit={async (event) => {
    event.preventDefault()
    const cents = parseEuroToCents(amount)
    await onAdd(quantity, Number.isFinite(cents) ? cents : 0)
  }}
>
  <strong>{entry.name}</strong>
  <label>
    Quantità
    <input bind:value={quantity} min="1" type="number" />
  </label>
  <label>
    Prezzo unitario
    <input bind:value={amount} inputmode="decimal" />
  </label>
  <button type="submit" disabled={saving}>Aggiungi</button>
</form>
