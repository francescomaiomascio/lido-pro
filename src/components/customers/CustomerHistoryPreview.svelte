<script lang="ts">
  import type { CustomerReservationSummary } from '../../lib/types/customerProfile'
  import CustomerReservationHistoryList from './CustomerReservationHistoryList.svelte'

  let {
    reservations,
    expanded,
    activeReservationId = null,
    onToggleExpanded,
    onSelectReservation,
  }: {
    reservations: CustomerReservationSummary[]
    expanded: boolean
    activeReservationId?: string | null
    onToggleExpanded: () => void
    onSelectReservation?: (reservationId: string) => void
  } = $props()
</script>

<section class="customer-profile-section customer-history-preview" aria-label="Ultime prenotazioni">
  <div class="settings-subheader customer-profile-section__heading">
    <div>
      <h3>{expanded ? 'Storico prenotazioni' : 'Ultime prenotazioni'}</h3>
      <p>{expanded ? 'Lista completa nel profilo cliente.' : 'Ultime 5 prenotazioni collegate al cliente.'}</p>
    </div>
    {#if reservations.length > 0}
      <button type="button" class="button-secondary" onclick={onToggleExpanded}>
        {expanded ? 'Riduci' : 'Vedi storico completo'}
      </button>
    {/if}
  </div>
  {#if reservations.length > 0}
    <CustomerReservationHistoryList {reservations} {activeReservationId} {onSelectReservation} />
  {:else}
    <p class="customer-profile-empty">Nessuna prenotazione registrata.</p>
  {/if}
</section>
