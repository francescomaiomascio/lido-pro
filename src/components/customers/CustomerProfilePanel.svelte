<script lang="ts">
  import { beachTypeLabels } from '../../lib/format/beachLabels'
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { accountStatusLabels, paymentMethodLabels } from '../../lib/format/accountLabels'
  import { reservationStatusLabels, reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { CustomerInput } from '../../lib/types/customer'
  import type {
    CustomerProfile,
    CustomerReservationSummary,
  } from '../../lib/types/customerProfile'
  import CustomerAnagraficaForm from './CustomerAnagraficaForm.svelte'
  import CustomerOperationalLinks from './CustomerOperationalLinks.svelte'

  type ProfileVariant = 'standalone' | 'embedded'

  let {
    profile,
    fullReservationHistory,
    saving,
    editing,
    historyExpanded,
    variant = 'standalone',
    onEdit,
    onCancelEdit,
    onSave,
    onToggleHistory,
  }: {
    profile: CustomerProfile
    fullReservationHistory: CustomerReservationSummary[]
    saving: boolean
    editing: boolean
    historyExpanded: boolean
    variant?: ProfileVariant
    onEdit: () => void
    onCancelEdit: () => void
    onSave: (input: CustomerInput) => void | Promise<void>
    onToggleHistory: () => void
  } = $props()

  const activeReservationId = $derived(profile.currentReservation?.id ?? null)
  const activeReservationSummary = $derived(
    activeReservationId
      ? fullReservationHistory.find((reservation) => reservation.reservationId === activeReservationId) ??
          profile.recentReservations.find((reservation) => reservation.reservationId === activeReservationId) ??
          null
      : null,
  )
  const recentReservationsWithCurrent = $derived(
    activeReservationSummary
      ? [
          activeReservationSummary,
          ...profile.recentReservations.filter(
            (reservation) => reservation.reservationId !== activeReservationSummary.reservationId,
          ),
        ].slice(0, 5)
      : profile.recentReservations,
  )
  const displayedReservations = $derived(
    historyExpanded ? fullReservationHistory : recentReservationsWithCurrent,
  )
  const currentPlaceLabel = $derived(
    profile.currentBeachItem
      ? [
          beachTypeLabels[profile.currentBeachItem.type],
          profile.currentBeachItem.rowLabel ? `Fila ${profile.currentBeachItem.rowLabel}` : null,
          profile.currentBeachItem.numberIndex ? `Posto ${profile.currentBeachItem.numberIndex}` : profile.currentBeachItem.code,
        ].filter(Boolean).join(' · ')
      : 'Nessun posto attivo',
  )
  const currentPeriodLabel = $derived(
    profile.currentReservation
      ? `${reservationTypeLabels[profile.currentReservation.reservationType]} · ${formatDateRangeItalian(
          profile.currentReservation.startDate,
          profile.currentReservation.endDate,
        )}`
      : 'Non impostato',
  )
  const currentAccountLabel = $derived(
    profile.currentAccount ? accountStatusLabels[profile.currentAccount.status] : 'Da preparare',
  )
  const lastPayment = $derived(profile.recentPayments[0] ?? null)
  const contactLine = $derived(
    [profile.customer.phone, profile.customer.email].filter(Boolean).join(' · ') || 'Nessun recapito',
  )
  const profileStatusLine = $derived(
    `${profile.customer.active ? 'Cliente attivo' : 'In archivio'} · Aggiornato ${formatCompactDateTime(profile.customer.updatedAt)}`,
  )
</script>

<article class={`customer-profile-panel customer-profile-panel--${variant}`} aria-label="Scheda cliente">
  <header class="customer-profile-header">
    <div class="customer-profile-title">
      <h2>{profile.customer.fullName}</h2>
      <p>{profileStatusLine}</p>
    </div>
    <div class="customer-profile-actions">
      {#if !editing}
        <button type="button" class="button-secondary" onclick={onEdit}>Modifica</button>
      {/if}
    </div>
  </header>

  <div class="customer-profile-grid">
    <section class="customer-profile-section customer-profile-section--anagrafica" aria-label="Anagrafica">
      <div class="customer-profile-section__heading">
        <span>Anagrafica</span>
      </div>

      {#if editing}
        <CustomerAnagraficaForm
          customer={profile.customer}
          {saving}
          onSave={onSave}
          onCancel={onCancelEdit}
        />
      {:else}
        <dl class="customer-field-table customer-field-table--primary">
          <div><dt>Nome e cognome</dt><dd>{profile.customer.fullName}</dd></div>
          <div><dt>Telefono</dt><dd>{profile.customer.phone || 'Non presente'}</dd></div>
          <div><dt>Email</dt><dd>{profile.customer.email || 'Non presente'}</dd></div>
          <div><dt>Note</dt><dd>{profile.customer.notes || 'Nessuna nota cliente.'}</dd></div>
        </dl>
      {/if}
    </section>

    <section class="customer-profile-section customer-profile-section--links" aria-label="Collegamenti operativi">
      <div class="customer-profile-section__heading">
        <span>Collegamenti operativi</span>
      </div>
      <CustomerOperationalLinks {profile} />
    </section>

    <section class="customer-profile-section customer-profile-section--current" aria-label="Operativita">
      <div class="customer-profile-section__heading">
        <span>Riepilogo operativo</span>
      </div>
      <dl class="customer-compact-facts">
        <div><dt>Posto</dt><dd>{currentPlaceLabel}</dd></div>
        <div><dt>Periodo</dt><dd>{currentPeriodLabel}</dd></div>
        <div>
          <dt>Stato</dt>
          <dd>{profile.currentReservation ? reservationStatusLabels[profile.currentReservation.status] : 'Nessuna prenotazione'}</dd>
        </div>
      </dl>
    </section>

    <section class="customer-profile-section customer-profile-section--ledger" aria-label="Conto">
      <div class="customer-profile-section__heading">
        <span>Conto</span>
      </div>
      <dl class="customer-ledger-strip">
        <div><dt>Dovuto</dt><dd>{formatEuroFromCents(profile.accountSummary.totalAmountCents)}</dd></div>
        <div><dt>Pagato</dt><dd>{formatEuroFromCents(profile.accountSummary.paidAmountCents)}</dd></div>
        <div><dt>Saldo</dt><dd>{formatEuroFromCents(profile.accountSummary.balanceAmountCents)}</dd></div>
        <div><dt>Stato</dt><dd>{currentAccountLabel}</dd></div>
      </dl>
      <p class="customer-profile-note">
        {#if lastPayment}
          Ultimo pagamento: {formatEuroFromCents(lastPayment.amountCents)} · {paymentMethodLabels[lastPayment.paymentMethod]} · {formatCompactDateTime(lastPayment.paidAt)}
        {:else}
          Nessun pagamento registrato.
        {/if}
      </p>
    </section>

    <section class="customer-profile-section customer-profile-section--history" aria-label="Storico recente">
      <div class="customer-profile-section__heading">
        <span>Storico recente</span>
        {#if fullReservationHistory.length > recentReservationsWithCurrent.length}
          <button type="button" class="button-link" onclick={onToggleHistory}>
            {historyExpanded ? 'Mostra recenti' : 'Mostra tutto'}
          </button>
        {/if}
      </div>

      <div class="customer-history-ledger">
        {#each displayedReservations as reservation (reservation.reservationId)}
          <div class="customer-history-ledger__row" class:active={reservation.reservationId === activeReservationId}>
            <div>
              <strong>{reservationTypeLabels[reservation.type]} · {beachTypeLabels[reservation.itemType]} {reservation.itemCode}</strong>
              <span>{formatDateRangeItalian(reservation.startDate, reservation.endDate)}</span>
            </div>
            <div>
              <span>{reservationStatusLabels[reservation.status]}{reservation.accountStatus ? ` · ${accountStatusLabels[reservation.accountStatus]}` : ''}</span>
              <strong>{formatEuroFromCents(reservation.balanceAmountCents)}</strong>
            </div>
          </div>
        {:else}
          <p class="customer-profile-empty">Nessuna prenotazione registrata.</p>
        {/each}
      </div>
    </section>
  </div>
</article>
