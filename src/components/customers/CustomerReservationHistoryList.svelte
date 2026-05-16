<script lang="ts">
  import { accountStatusLabels } from '../../lib/format/accountLabels'
  import { beachTypeLabels } from '../../lib/format/beachLabels'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { reservationStatusLabels, reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { CustomerReservationSummary } from '../../lib/types/customerProfile'

  let {
    reservations,
    activeReservationId = null,
    onSelectReservation,
  }: {
    reservations: CustomerReservationSummary[]
    activeReservationId?: string | null
    onSelectReservation?: (reservationId: string) => void
  } = $props()
</script>

<div class="customer-history-list">
  {#each reservations as reservation (reservation.reservationId)}
    <article class="customer-history-row" class:current={reservation.reservationId === activeReservationId}>
      <button
        type="button"
        class="customer-history-row__button"
        onclick={() => onSelectReservation?.(reservation.reservationId)}
      >
        <div>
          <strong>
            {reservationTypeLabels[reservation.type]} · {beachTypeLabels[reservation.itemType]} {reservation.itemCode}
            {#if reservation.reservationId === activeReservationId}
              <em>Attiva</em>
            {/if}
          </strong>
          <span>{formatDateRangeItalian(reservation.startDate, reservation.endDate)}</span>
          <small>
            {reservationStatusLabels[reservation.status]}
            {reservation.accountStatus ? ` · ${accountStatusLabels[reservation.accountStatus]}` : ''}
            · {reservation.extrasSummary}
          </small>
        </div>
        <p>
          Totale {formatEuroFromCents(reservation.totalAmountCents)} · Pagato {formatEuroFromCents(reservation.paidAmountCents)} · Saldo {formatEuroFromCents(reservation.balanceAmountCents)}
        </p>
      </button>
    </article>
  {:else}
    <p class="customer-profile-empty">Nessuna prenotazione registrata.</p>
  {/each}
</div>
