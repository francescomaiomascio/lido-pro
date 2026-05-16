<script lang="ts">
  import { accountStatusLabels } from '../../lib/format/accountLabels'
  import { beachTypeLabels } from '../../lib/format/beachLabels'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { CustomerProfile } from '../../lib/types/customerProfile'

  let {
    profile,
  }: {
    profile: CustomerProfile
  } = $props()
</script>

<section class="customer-profile-section customer-activity-card" aria-label="Prenotazione attiva">
  <div class="settings-subheader">
    <h3>Prenotazione attiva</h3>
  </div>

  {#if profile.currentReservation}
    <dl class="settings-definition-list">
      <div><dt>Tipo</dt><dd>{reservationTypeLabels[profile.currentReservation.reservationType]}</dd></div>
      <div><dt>Periodo</dt><dd>{formatDateRangeItalian(profile.currentReservation.startDate, profile.currentReservation.endDate)}</dd></div>
      <div>
        <dt>Posto</dt>
        <dd>
          {profile.currentBeachItem
            ? `${beachTypeLabels[profile.currentBeachItem.type]} ${profile.currentBeachItem.code}`
            : 'Non disponibile'}
        </dd>
      </div>
      <div><dt>Conto</dt><dd>{profile.currentAccount ? accountStatusLabels[profile.currentAccount.status] : 'Non collegato'}</dd></div>
      <div><dt>Saldo</dt><dd>{formatEuroFromCents(profile.currentAccount?.balanceAmountCents ?? 0)}</dd></div>
    </dl>
  {:else if profile.currentAssignment && profile.currentBeachItem}
    <p class="customer-profile-empty">
      Cliente assegnato a {profile.currentBeachItem.code}, periodo non configurato.
    </p>
  {:else}
    <p class="customer-profile-empty">Nessuna prenotazione attiva</p>
  {/if}
</section>
