<script lang="ts">
  import { getBeachItemStatusLabel, getBeachItemTypeLabel, getBeachItemUsageTypeLabel } from '../../lib/format/beachLabels'
  import { accountStatusLabels } from '../../lib/format/accountLabels'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { reservationTypeLabels } from '../../lib/format/reservationLabels'
  import { requestOpenRegistry } from '../../lib/state/registryFilters'
  import type { BeachItem } from '../../lib/types/beach'
  import type { AccountLedger, ReservationSummary } from '../../lib/types/reservationSummary'
  import AccountLedgerPanel from '../accounts/AccountLedgerPanel.svelte'
  import ReservationSummaryCard from '../reservations/ReservationSummaryCard.svelte'

  let {
    item,
    reservationSummary,
    accountLedger,
  }: {
    item: BeachItem
    reservationSummary: ReservationSummary | null
    accountLedger: AccountLedger | null
  } = $props()
</script>

<section class="operational-overview">
  <section class="overview-card overview-card--hero">
    <div class="overview-hero">
      <div>
        <span>{getBeachItemTypeLabel(item.type)}</span>
        <h3>{item.code}</h3>
      </div>
      <div class="overview-badges">
        <small>{getBeachItemStatusLabel(item.status)}</small>
        <small>{getBeachItemUsageTypeLabel(item.usageType)}</small>
      </div>
    </div>
    <button
      type="button"
      class="button-secondary overview-registry-link"
      onclick={() =>
        requestOpenRegistry({
          customerId: item.assignedCustomer?.customer.id,
          customerName: item.assignedCustomer?.customer.fullName,
          itemId: item.id,
          itemCode: item.code,
          reservationId: item.currentReservation?.id,
        })}
    >
      Vedi nel Registro
    </button>
  </section>

  <section class="overview-card">
    <h4>Operativo</h4>
    <dl class="overview-grid">
      <div><dt>Cliente</dt><dd>{item.assignedCustomer?.customer.fullName ?? 'Nessun cliente'}</dd></div>
      <div>
        <dt>Periodo</dt>
        <dd>
          {#if item.currentReservation}
            {reservationTypeLabels[item.currentReservation.reservationType]} ·
            {formatDateRangeItalian(item.currentReservation.startDate, item.currentReservation.endDate)}
          {:else}
            Nessuna prenotazione
          {/if}
        </dd>
      </div>
      <div>
        <dt>Tariffa</dt>
        <dd>{item.activeAccount ? formatEuroFromCents(item.activeAccount.baseAmountCents) : 'Non impostata'}</dd>
      </div>
      <div>
        <dt>Conto</dt>
        <dd>{item.activeAccount ? accountStatusLabels[item.activeAccount.status] : 'Nessun conto'}</dd>
      </div>
      <div>
        <dt>Saldo</dt>
        <dd>{item.activeAccount ? formatEuroFromCents(item.activeAccount.balanceAmountCents) : '-'}</dd>
      </div>
      <div>
        <dt>Extra</dt>
        <dd>{item.activeAccount?.extrasAmountCents ? formatEuroFromCents(item.activeAccount.extrasAmountCents) : 'Nessuno'}</dd>
      </div>
    </dl>
  </section>

  {#if reservationSummary}
    <ReservationSummaryCard summary={reservationSummary} compact />
  {/if}

  {#if accountLedger}
    <AccountLedgerPanel ledger={accountLedger} compact />
  {/if}

  <section class="overview-card">
    <h4>Nota</h4>
    <p class="overview-note-preview">{item.operationalNote?.trim() || 'Nessuna nota operativa.'}</p>
  </section>
</section>
