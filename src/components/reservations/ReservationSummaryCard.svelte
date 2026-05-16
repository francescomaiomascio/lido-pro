<script lang="ts">
  import { accountStatusLabels } from '../../lib/format/accountLabels'
  import { beachTypeLabels } from '../../lib/format/beachLabels'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { reservationStatusLabels, reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { ReservationSummary } from '../../lib/types/reservationSummary'

  let {
    summary,
    compact = false,
  }: {
    summary: ReservationSummary | null
    compact?: boolean
  } = $props()
</script>

<section class="reservation-summary-card" class:compact aria-label="Riepilogo prenotazione">
  {#if summary}
    <header class="ledger-header">
      <div>
        <span>{reservationStatusLabels[summary.reservationStatus]}</span>
        <h3>
          {reservationTypeLabels[summary.reservationType]}
          {#if summary.beachItem}
            · {beachTypeLabels[summary.beachItem.type]} {summary.beachItem.code}
          {:else}
            · {summary.itemCode}
          {/if}
        </h3>
        <p>{formatDateRangeItalian(summary.startDate, summary.endDate)}</p>
      </div>
      {#if summary.accountStatus}
        <strong>{accountStatusLabels[summary.accountStatus]}</strong>
      {/if}
    </header>

    <dl class="reservation-summary-lines">
      <div><dt>Cliente</dt><dd>{summary.customerName}</dd></div>
      <div><dt>Posto</dt><dd>{summary.beachItem ? `${beachTypeLabels[summary.beachItem.type]} ${summary.beachItem.code}` : summary.itemCode}</dd></div>
      <div><dt>Extra</dt><dd>{summary.extrasSummary}</dd></div>
      <div><dt>Inclusi</dt><dd>{summary.includedItemsSummary}</dd></div>
    </dl>

    <dl class="ledger-metrics">
      <div><dt>Totale</dt><dd>{formatEuroFromCents(summary.totalAmountCents)}</dd></div>
      <div><dt>Pagato</dt><dd>{formatEuroFromCents(summary.paidAmountCents)}</dd></div>
      <div><dt>Saldo</dt><dd>{formatEuroFromCents(summary.balanceAmountCents)}</dd></div>
      <div><dt>Pagamenti</dt><dd>{summary.paymentCount}</dd></div>
    </dl>

    {#if !compact && summary.reservation.notes}
      <p class="ledger-note">{summary.reservation.notes}</p>
    {/if}
  {:else}
    <p class="ledger-empty">Nessuna prenotazione collegata.</p>
  {/if}
</section>
