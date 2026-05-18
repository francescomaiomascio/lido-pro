<script lang="ts">
  import { requestOpenRegistry } from '../../lib/state/registryFilters'
  import type { CustomerProfile } from '../../lib/types/customerProfile'

  let {
    profile,
  }: {
    profile: CustomerProfile
  } = $props()

  const registryRequest = (includeReservation = false) => {
    requestOpenRegistry({
      customerId: profile.customer.id,
      customerName: profile.customer.fullName,
      itemId: profile.currentBeachItem?.id ?? undefined,
      itemCode: profile.currentBeachItem?.code ?? undefined,
      reservationId: includeReservation ? (profile.currentReservation?.id ?? undefined) : undefined,
    })
  }
</script>

<div class="customer-operational-links" aria-label="Collegamenti operativi">
  <button
    type="button"
    disabled={!profile.currentBeachItem}
    title={profile.currentBeachItem ? 'Apri il contesto posto nel registro' : 'Nessun posto attivo'}
    onclick={() => registryRequest()}
  >
    Spiaggia
  </button>
  <button
    type="button"
    disabled={!profile.currentReservation}
    title={profile.currentReservation ? 'Apri prenotazione nel registro' : 'Nessuna prenotazione attiva'}
    onclick={() => registryRequest(true)}
  >
    Prenotazioni
  </button>
  <button
    type="button"
    disabled={!profile.currentAccount}
    title={profile.currentAccount ? 'Apri conto cliente nel registro' : 'Nessun conto attivo'}
    onclick={() => registryRequest(true)}
  >
    Conto
  </button>
  <button type="button" onclick={() => registryRequest(true)}>Registro</button>
  <button
    type="button"
    disabled={profile.recentReservations.length === 0 && profile.recentPayments.length === 0}
    title="Apri attività cliente nel registro"
    onclick={() => registryRequest()}
  >
    Attività recente
  </button>
</div>
