<script lang="ts">
  import { accountStatusLabels } from '../../lib/format/accountLabels'
  import { getBeachItemStatusLabel, getBeachItemTypeLabel } from '../../lib/format/beachLabels'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { BeachItem } from '../../lib/types/beach'

  let {
    item,
    onOpenPanel,
  }: {
    item: BeachItem | null
    onOpenPanel: () => void
  } = $props()
</script>

<aside class="detail-panel overview-panel" aria-label="Overview posto">
  {#if item}
    <div class="detail-header">
      <span>{getBeachItemTypeLabel(item.type)}</span>
      <h2>{item.code}</h2>
      <strong class={`status-text status-text--${item.status}`}>{getBeachItemStatusLabel(item.status)}</strong>
    </div>

    <dl class="detail-list">
      <div><dt>Cliente</dt><dd>{item.assignedCustomer?.customer.fullName ?? 'Nessun cliente'}</dd></div>
      <div>
        <dt>Periodo</dt>
        <dd>
          {#if item.currentReservation}
            {reservationTypeLabels[item.currentReservation.reservationType]}
            · {formatDateRangeItalian(item.currentReservation.startDate, item.currentReservation.endDate)}
          {:else}
            Nessuna prenotazione
          {/if}
        </dd>
      </div>
      <div>
        <dt>Conto</dt>
        <dd>
          {#if item.activeAccount}
            {accountStatusLabels[item.activeAccount.status]}
          {:else}
            Nessun conto
          {/if}
        </dd>
      </div>
      <div>
        <dt>Saldo</dt>
        <dd>{item.activeAccount ? formatEuroFromCents(item.activeAccount.balanceAmountCents) : '-'}</dd>
      </div>
    </dl>

    <button class="open-operational-button" type="button" onclick={onOpenPanel}>
      Apri pannello operativo
    </button>
  {:else}
    <div class="empty-detail">
      <h2>Nessun posto selezionato</h2>
      <p>Tocca un posto sulla mappa o dalla lista.</p>
    </div>
  {/if}
</aside>
