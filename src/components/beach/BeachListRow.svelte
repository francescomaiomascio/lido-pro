<script lang="ts">
  import {
    getBeachItemStatusLabel,
    getBeachItemTypeLabel,
    getBeachItemUsageTypeLabel,
    getDisplayCode,
  } from '../../lib/format/beachLabels'
  import { accountStatusLabels } from '../../lib/format/accountLabels'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { BeachItem } from '../../lib/types/beach'

  let {
    item,
    selected,
    onOpen,
  }: {
    item: BeachItem
    selected: boolean
    onOpen: (itemId: string) => void
  } = $props()

  const customerName = $derived(item.assignedCustomer?.customer.fullName ?? 'Nessun cliente')
  const accountLabel = $derived.by(() => {
    if (!item.activeAccount) return 'Nessun conto'
    if (item.activeAccount.status === 'paid') return accountStatusLabels[item.activeAccount.status]
    return `Saldo ${formatEuroFromCents(item.activeAccount.balanceAmountCents)}`
  })
  const reservationLabel = $derived.by(() => {
    if (!item.currentReservation) return 'Nessuna prenotazione'
    return `${reservationTypeLabels[item.currentReservation.reservationType]} · ${formatDateRangeItalian(item.currentReservation.startDate, item.currentReservation.endDate)}`
  })
</script>

<article class="beach-list-row" class:selected>
  <div class="beach-list-cell beach-list-cell--identity">
    <strong>{getDisplayCode(item)}</strong>
    <span>{getBeachItemTypeLabel(item.type)} · {getBeachItemUsageTypeLabel(item.usageType)} · {item.rowLabel} / {item.numberIndex}</span>
  </div>
  <div class="beach-list-cell beach-list-cell--customer"><strong>{customerName}</strong><span>{item.operationalNote ? 'Nota presente' : 'Nessuna nota'}</span></div>
  <div class="beach-list-cell beach-list-cell--reservation"><strong>{reservationLabel}</strong><span>{item.currentReservation ? 'Periodo attivo' : 'Da impostare'}</span></div>
  <div class="beach-list-cell beach-list-cell--money"><strong>{accountLabel}</strong><span>{item.activeAccount ? accountStatusLabels[item.activeAccount.status] : 'In attesa'}</span></div>
  <span class={`row-status row-status--${item.status}`}>{getBeachItemStatusLabel(item.status)}</span>
  <button type="button" onclick={() => onOpen(item.id)}>Apri</button>
</article>
