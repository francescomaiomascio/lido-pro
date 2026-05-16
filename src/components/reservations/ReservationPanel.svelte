<script lang="ts">
  import type { Account } from '../../lib/types/account'
  import type { BeachItemAssignedCustomer } from '../../lib/types/customer'
  import type { Reservation, ReservationInput } from '../../lib/types/reservation'
  import type { ReservationSummary as ReservationSummaryProjection } from '../../lib/types/reservationSummary'
  import ReservationForm from './ReservationForm.svelte'
  import ReservationSummary from './ReservationSummary.svelte'
  import ReservationSummaryCard from './ReservationSummaryCard.svelte'

  type Mode = 'summary' | 'form'

  let {
    itemId,
    itemCode,
    assignedCustomer,
    account,
    reservation,
    summary = null,
    saving,
    onCreateReservation,
    onUpdateReservation,
    onCancelReservation,
  }: {
    itemId: string
    itemCode: string
    assignedCustomer: BeachItemAssignedCustomer | null
    account: Account | null
    reservation: Reservation | null
    summary?: ReservationSummaryProjection | null
    saving: boolean
    onCreateReservation: (input: ReservationInput) => void | Promise<void>
    onUpdateReservation: (
      reservationId: string,
      input: ReservationInput,
    ) => void | Promise<void>
    onCancelReservation: (reservationId: string) => void | Promise<void>
  } = $props()

  let mode: Mode = $state('summary')
</script>

<section class="reservation-panel" aria-label="Periodo prenotazione">
  <div class="section-heading">
    <h3>Periodo</h3>
  </div>

  {#if !assignedCustomer}
    <p class="empty-customer">Assegna prima un cliente per impostare il periodo.</p>
  {:else if mode === 'form'}
    <ReservationForm
      reservation={reservation}
      {itemId}
      {itemCode}
      customerId={assignedCustomer.customer.id}
      customerName={assignedCustomer.customer.fullName}
      assignmentId={assignedCustomer.assignment.id}
      accountId={account?.id ?? null}
      defaultReservationType={assignedCustomer.assignment.assignmentType}
      {saving}
      onSave={async (input) => {
        if (reservation) {
          await onUpdateReservation(reservation.id, input)
        } else {
          await onCreateReservation(input)
        }
        mode = 'summary'
      }}
      onCancel={() => (mode = 'summary')}
    />
  {:else if reservation}
    {#if summary}
      <ReservationSummaryCard {summary} compact />
    {:else}
      <ReservationSummary {reservation} />
    {/if}
    <div class="customer-actions">
      <button type="button" disabled={saving} onclick={() => (mode = 'form')}>Modifica periodo</button>
      <button type="button" disabled={saving} onclick={() => onCancelReservation(reservation.id)}>
        Annulla prenotazione
      </button>
    </div>
  {:else}
    <p class="empty-customer">Nessuna prenotazione attiva</p>
    <div class="customer-actions">
      <button type="button" disabled={saving} onclick={() => (mode = 'form')}>Crea prenotazione</button>
    </div>
  {/if}
</section>
