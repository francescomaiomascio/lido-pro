<script lang="ts">
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { reservationStatusLabels, reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { Reservation } from '../../lib/types/reservation'

  let {
    reservations,
  }: {
    reservations: Reservation[]
  } = $props()
</script>

<section class="reservation-list" aria-label="Prenotazioni">
  {#each reservations as reservation (reservation.id)}
    <article>
      <strong>{reservationTypeLabels[reservation.reservationType]}</strong>
      <span>{formatDateRangeItalian(reservation.startDate, reservation.endDate)}</span>
      <small>{reservationStatusLabels[reservation.status]}</small>
    </article>
  {:else}
    <p>Nessuna prenotazione.</p>
  {/each}
</section>
