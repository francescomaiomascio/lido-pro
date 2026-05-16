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
    onClose,
  }: {
    item: BeachItem | null
    onOpenPanel: () => void
    onClose: () => void
  } = $props()
</script>

{#if item}
  <aside class="floating-focus-card" aria-label="Focus posto selezionato">
    <div class="floating-focus-card__header">
      <div class="detail-header">
        <span>{getBeachItemTypeLabel(item.type)}</span>
        <h2>{item.code}</h2>
        <strong class={`status-text status-text--${item.status}`}>
          {getBeachItemStatusLabel(item.status)}
        </strong>
      </div>
      <button type="button" class="floating-focus-card__close" onclick={onClose}>Chiudi</button>
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
        <dd>{item.activeAccount ? accountStatusLabels[item.activeAccount.status] : 'Nessun conto'}</dd>
      </div>
      <div>
        <dt>Saldo</dt>
        <dd>{item.activeAccount ? formatEuroFromCents(item.activeAccount.balanceAmountCents) : '-'}</dd>
      </div>
    </dl>

    <button class="open-operational-button" type="button" onclick={onOpenPanel}>
      Apri pannello operativo
    </button>
  </aside>
{/if}
