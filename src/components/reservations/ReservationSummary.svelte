<script lang="ts">
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { reservationStatusLabels, reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { Reservation } from '../../lib/types/reservation'

  let {
    reservation,
  }: {
    reservation: Reservation
  } = $props()
</script>

<div class="reservation-summary">
  <strong>{reservationTypeLabels[reservation.reservationType]}</strong>
  <span>{formatDateRangeItalian(reservation.startDate, reservation.endDate)}</span>
  <span>{reservationStatusLabels[reservation.status]}</span>
  {#if reservation.notes}
    <p>{reservation.notes}</p>
  {/if}
</div>
