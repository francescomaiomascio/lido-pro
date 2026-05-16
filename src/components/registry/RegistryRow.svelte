<script lang="ts">
  import { accountStatusLabels } from '../../lib/format/accountLabels'
  import { beachTypeLabels } from '../../lib/format/beachLabels'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { reservationStatusLabels, reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { RegistryRecord } from '../../lib/types/registry'

  let {
    record,
    selected = false,
    onSelect,
  }: {
    record: RegistryRecord
    selected?: boolean
    onSelect: (record: RegistryRecord) => void
  } = $props()

  const itemLabel = $derived(
    record.itemType ? `${beachTypeLabels[record.itemType]} ${record.itemCode}` : record.itemCode,
  )
  const periodLabel = $derived(
    record.startDate && record.endDate
      ? formatDateRangeItalian(record.startDate, record.endDate)
      : 'Periodo non disponibile',
  )
  const statusLabel = $derived(
    record.accountStatus
      ? accountStatusLabels[record.accountStatus]
      : record.reservationStatus
        ? reservationStatusLabels[record.reservationStatus]
        : 'Senza conto',
  )
  const paidProgress = $derived(
    record.totalAmountCents > 0
      ? Math.min(100, Math.round((record.paidAmountCents / record.totalAmountCents) * 100))
      : record.balanceAmountCents <= 0
        ? 100
        : 0,
  )
</script>

<article class="registry-row" class:selected>
  <button type="button" onclick={() => onSelect(record)}>
    <div class="registry-cell registry-cell--customer" data-label="Cliente">
      <strong>{record.customerName}</strong>
      <span>{record.customerPhone || 'Telefono non presente'}</span>
    </div>
    <div class="registry-cell" data-label="Posto / extra">
      <strong>{itemLabel}</strong>
      <span>{record.extrasSummary}</span>
    </div>
    <div class="registry-cell" data-label="Periodo">
      <strong>{periodLabel}</strong>
      <span>{record.reservationType ? reservationTypeLabels[record.reservationType] : 'Conto senza prenotazione'}</span>
    </div>
    <div class="registry-cell registry-cell--money" data-label="Totale">
      <strong>{formatEuroFromCents(record.totalAmountCents)}</strong>
      <span>Dovuto</span>
    </div>
    <div class="registry-cell registry-cell--money" data-label="Pagato">
      <strong>{formatEuroFromCents(record.paidAmountCents)}</strong>
      <span>{record.paymentCount} pagamenti · {paidProgress}%</span>
      <i class="registry-row-progress" style={`--paid-progress: ${paidProgress}%`}></i>
    </div>
    <div class="registry-cell registry-cell--money balance" class:settled={record.balanceAmountCents <= 0} data-label="Saldo">
      <strong>{formatEuroFromCents(record.balanceAmountCents)}</strong>
      <span>{record.balanceAmountCents > 0 ? 'Da chiudere' : 'Chiuso'}</span>
    </div>
    <div class={`registry-cell registry-cell--status registry-status--${record.accountStatus ?? 'none'}`} data-label="Stato"><em>{statusLabel}</em></div>
  </button>
</article>
