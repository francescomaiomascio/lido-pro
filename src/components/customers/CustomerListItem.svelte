<script lang="ts">
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { CustomerSearchSummary } from '../../lib/types/customerProfile'

  let {
    row,
    selected,
    onSelect,
  }: {
    row: CustomerSearchSummary
    selected: boolean
    onSelect: () => void
  } = $props()

  const contactLine = $derived(row.customer.phone || row.customer.email || 'Contatti non inseriti')
  const statusLabel = $derived(
    row.status === 'open-balance'
      ? 'Saldo aperto'
      : row.status === 'active'
        ? 'Cliente attivo'
        : 'In archivio',
  )
  const placeLine = $derived(
    row.currentPlaceLabel ? `Posto: ${row.currentPlaceLabel}` : 'Nessun posto assegnato',
  )
</script>

<button
  type="button"
  class="customer-list-item"
  class:selected
  aria-pressed={selected}
  onclick={onSelect}
>
  <span class="customer-list-item__main">
    <strong>{row.customer.fullName}</strong>
    <small>{contactLine} · {statusLabel}</small>
    <em>{placeLine}</em>
  </span>
  <span class="customer-list-item__side">
    {#if row.balanceAmountCents > 0}
      <strong>{formatEuroFromCents(row.balanceAmountCents)}</strong>
    {:else}
      <strong>OK</strong>
    {/if}
    <small>{row.hasActiveReservation ? 'Prenotazione' : row.hasOpenAccount ? 'Conto' : 'Profilo'}</small>
  </span>
</button>
