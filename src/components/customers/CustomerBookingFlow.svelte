<script lang="ts">
  import { beachStatusLabels, beachTypeLabels, sortBeachItems } from '../../lib/format/beachLabels'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { accountStatusLabels } from '../../lib/format/accountLabels'
  import { reservationTypeLabels } from '../../lib/format/reservationLabels'
  import { getDefaultDailyPeriod, getDefaultSeasonalPeriod, isDateRangeValid } from '../../lib/reservations/periodRules'
  import {
    confirmCustomerBooking,
    searchAvailableItemsForCustomerBooking,
    type CustomerBookingAvailableItem,
    type CustomerBookingConfirmResult,
    type CustomerBookingErrorCode,
  } from '../../lib/booking/customerBookingService'
  import type { BeachItemType } from '../../lib/types/beach'
  import type { CustomerProfile } from '../../lib/types/customerProfile'
  import type { ReservationType } from '../../lib/types/reservation'
  import ActionActivity from '../loading/ActionActivity.svelte'

  let {
    profile,
    onClose,
    onCompleted,
    onOpenBeachItem,
  }: {
    profile: CustomerProfile
    onClose: () => void
    onCompleted: (result: CustomerBookingConfirmResult) => void | Promise<void>
    onOpenBeachItem?: (itemId: string) => void | Promise<void>
  } = $props()

  type FlowStage = 'period' | 'availability' | 'place' | 'account' | 'confirm'
  type ItemTypeFilter = BeachItemType | 'all'

  let stage: FlowStage = $state('period')
  let reservationType: ReservationType = $state('daily')
  let startDate = $state(getDefaultDailyPeriod().startDate)
  let endDate = $state(getDefaultDailyPeriod().endDate)
  let itemType: ItemTypeFilter = $state('all')
  let availabilityRows = $state<CustomerBookingAvailableItem[]>([])
  let totalItems = $state(0)
  let availableCount = $state(0)
  let selectedItemId = $state<string | null>(null)
  let confirmResult = $state<CustomerBookingConfirmResult | null>(null)
  let searching = $state(false)
  let confirming = $state(false)
  let error = $state<string | null>(null)

  const steps: { id: FlowStage; label: string }[] = [
    { id: 'period', label: 'Periodo' },
    { id: 'availability', label: 'Disponibilita' },
    { id: 'place', label: 'Posto' },
    { id: 'account', label: 'Conto' },
    { id: 'confirm', label: 'Conferma' },
  ]

  const typeOptions: { id: ItemTypeFilter; label: string }[] = [
    { id: 'all', label: 'Tutti' },
    { id: 'palm', label: 'Palma' },
    { id: 'umbrella', label: 'Ombrellone' },
    { id: 'small_palm', label: 'Palmetta' },
  ]

  const selectedRow = $derived(
    selectedItemId ? availabilityRows.find((row) => row.item.id === selectedItemId) ?? null : null,
  )
  const selectedPeriodLabel = $derived(
    startDate && endDate ? formatDateRangeItalian(startDate, endDate) : 'Periodo non impostato',
  )
  const periodSummary = $derived(`${reservationTypeLabels[reservationType]} · ${selectedPeriodLabel}`)
  const accountStateLabel = $derived(
    confirmResult?.account ? accountStatusLabels[confirmResult.account.status] : 'Da preparare',
  )
  const canOpenBeachItem = $derived(Boolean(confirmResult && onOpenBeachItem))

  const getErrorMessage = (code: CustomerBookingErrorCode) => {
    switch (code) {
      case 'missing_customer':
        return 'Cliente richiesto prima della prenotazione.'
      case 'missing_period':
        return 'Periodo prenotazione non impostato.'
      case 'no_available_items':
        return 'Nessun posto disponibile per il periodo selezionato.'
      case 'unavailable_item':
        return 'Posto non disponibile per il periodo selezionato.'
      case 'account_prepare_failed':
        return 'Preparazione conto non riuscita.'
      case 'pricing_unavailable':
        return 'Prezzo non disponibile.'
      case 'reservation_save_failed':
        return 'Salvataggio prenotazione non riuscito.'
    }
  }

  const toErrorMessage = (caught: unknown) => {
    if (caught && typeof caught === 'object' && 'code' in caught) {
      return getErrorMessage((caught as { code: CustomerBookingErrorCode }).code)
    }
    return caught instanceof Error ? caught.message : 'Operazione non riuscita.'
  }

  const applyType = (type: ReservationType) => {
    reservationType = type
    const period = type === 'seasonal' ? getDefaultSeasonalPeriod() : getDefaultDailyPeriod()
    startDate = period.startDate
    endDate = period.endDate
    availabilityRows = []
    selectedItemId = null
    confirmResult = null
    stage = 'period'
    error = null
  }

  const searchAvailability = async () => {
    if (!isDateRangeValid(startDate, endDate)) {
      error = 'Periodo non valido.'
      return
    }

    searching = true
    error = null
    selectedItemId = null
    confirmResult = null
    try {
      const result = await searchAvailableItemsForCustomerBooking({
        customerId: profile.customer.id,
        reservationType,
        startDate,
        endDate,
        itemType,
      })
      availabilityRows = result.items.toSorted((a, b) => sortBeachItems(a.item, b.item))
      totalItems = result.availability.total
      availableCount = result.availability.available
      stage = 'availability'
      if (availabilityRows.length === 0) {
        error = getErrorMessage('no_available_items')
      }
    } catch (caught) {
      availabilityRows = []
      totalItems = 0
      availableCount = 0
      error = toErrorMessage(caught)
    } finally {
      searching = false
    }
  }

  const selectItem = (itemId: string) => {
    selectedItemId = itemId
    stage = 'place'
    error = null
  }

  const confirmBooking = async () => {
    if (!selectedItemId) {
      error = 'Scegli un posto disponibile.'
      return
    }

    confirming = true
    error = null
    try {
      const result = await confirmCustomerBooking({
        customerId: profile.customer.id,
        itemId: selectedItemId,
        reservationType,
        startDate,
        endDate,
        manualAmountCents: null,
      })
      confirmResult = result
      stage = 'confirm'
      await onCompleted(result)
    } catch (caught) {
      error = toErrorMessage(caught)
    } finally {
      confirming = false
    }
  }

  const openBeachItem = async () => {
    if (!confirmResult || !onOpenBeachItem) {
      return
    }
    await onOpenBeachItem(confirmResult.item.id)
  }
</script>

<section class="customer-booking-flow" aria-label="Nuova prenotazione cliente">
  <header class="customer-booking-flow__header">
    <div>
      <span>Nuova prenotazione</span>
      <h3>{profile.customer.fullName}</h3>
      <p>{periodSummary}</p>
    </div>
    <button type="button" class="button-secondary" onclick={onClose}>Torna al cliente</button>
  </header>

  <nav class="customer-booking-flow__steps" aria-label="Stato prenotazione">
    {#each steps as step}
      <span class:active={stage === step.id} class:done={steps.findIndex((current) => current.id === step.id) < steps.findIndex((current) => current.id === stage)}>
        {step.label}
      </span>
    {/each}
  </nav>

  <div class="customer-booking-flow__body">
    <section class="customer-booking-flow__section customer-booking-flow__section--period" aria-label="Periodo">
      <div class="customer-booking-flow__section-head">
        <span>Periodo</span>
        <strong>{selectedPeriodLabel}</strong>
      </div>
      <div class="customer-booking-flow__segments">
        <button type="button" class:active={reservationType === 'daily'} onclick={() => applyType('daily')}>Giornaliero</button>
        <button type="button" class:active={reservationType === 'seasonal'} onclick={() => applyType('seasonal')}>Stagionale</button>
      </div>
      <div class="customer-booking-flow__fields">
        <label>Dal<input type="date" bind:value={startDate} /></label>
        <label>Al<input type="date" bind:value={endDate} /></label>
      </div>
      <p>Intervallo su piu giorni supportato come prenotazione giornaliera.</p>
    </section>

    <section class="customer-booking-flow__section customer-booking-flow__section--availability" aria-label="Disponibilita">
      <div class="customer-booking-flow__section-head">
        <span>Disponibilita</span>
        <strong>{availableCount}/{totalItems || '-'} posti</strong>
      </div>
      <div class="customer-booking-flow__filters">
        {#each typeOptions as option}
          <button type="button" class:active={itemType === option.id} onclick={() => (itemType = option.id)}>
            {option.label}
          </button>
        {/each}
      </div>
      <button type="button" class="button-primary" disabled={searching} onclick={searchAvailability}>
        {#if searching}
          <ActionActivity label="Verifica disponibilita" />
        {:else}
          Cerca disponibilita
        {/if}
      </button>
      {#if error && stage !== 'confirm'}
        <p class="customer-booking-flow__error">{error}</p>
      {/if}
    </section>

    <section class="customer-booking-flow__section customer-booking-flow__section--places" aria-label="Posti disponibili">
      <div class="customer-booking-flow__section-head">
        <span>Posto</span>
        <strong>{selectedRow ? selectedRow.item.code : 'Da selezionare'}</strong>
      </div>
      <div class="customer-booking-flow__places">
        {#each availabilityRows as row (row.item.id)}
          <article class="customer-booking-flow__place" class:selected={selectedItemId === row.item.id}>
            <div>
              <strong>{row.item.code}</strong>
              <span>{beachTypeLabels[row.item.type]} · Fila {row.item.rowLabel || '-'} · Posto {row.item.numberIndex}</span>
            </div>
            <div>
              <span>{beachStatusLabels[row.item.status]} · {row.availability.status === 'available' ? 'Disponibile' : row.availability.status}</span>
              {#if row.priceSuggestion && row.priceSuggestion.confidence !== 'none'}
                <small>{formatEuroFromCents(row.priceSuggestion.amountCents)} suggeriti</small>
              {:else}
                <small>Prezzo da verificare</small>
              {/if}
            </div>
            <button type="button" onclick={() => selectItem(row.item.id)}>Seleziona</button>
          </article>
        {:else}
          <p class="customer-booking-flow__empty">Nessun posto disponibile per il periodo selezionato.</p>
        {/each}
      </div>
    </section>

    <section class="customer-booking-flow__section customer-booking-flow__section--confirm" aria-label="Conto e conferma">
      <div class="customer-booking-flow__section-head">
        <span>Conto</span>
        <strong>{accountStateLabel}</strong>
      </div>
      {#if selectedRow}
        <dl class="customer-booking-flow__summary">
          <div><dt>Cliente</dt><dd>{profile.customer.fullName}</dd></div>
          <div><dt>Posto</dt><dd>{beachTypeLabels[selectedRow.item.type]} {selectedRow.item.code}</dd></div>
          <div><dt>Periodo</dt><dd>{periodSummary}</dd></div>
          <div>
            <dt>Prezzo</dt>
            <dd>
              {#if selectedRow.priceSuggestion && selectedRow.priceSuggestion.confidence !== 'none'}
                {formatEuroFromCents(selectedRow.priceSuggestion.amountCents)} suggeriti
              {:else}
                Da Articoli/manuale nel conto
              {/if}
            </dd>
          </div>
        </dl>
        {#if !confirmResult}
          <button type="button" class="button-primary" disabled={confirming} onclick={confirmBooking}>
            {#if confirming}
              <ActionActivity label="Conferma prenotazione" />
            {:else}
              Conferma prenotazione
            {/if}
          </button>
        {:else}
          <div class="customer-booking-flow__done">
            <strong>Prenotazione creata</strong>
            <span>Conto {accountStatusLabels[confirmResult.account.status]} · {formatEuroFromCents(confirmResult.account.balanceAmountCents)} saldo</span>
          </div>
          <div class="customer-booking-flow__actions">
            {#if canOpenBeachItem}
              <button type="button" class="button-secondary" onclick={openBeachItem}>Apri in Spiaggia</button>
            {/if}
            <button type="button" class="button-secondary" onclick={onClose}>Torna al cliente</button>
          </div>
        {/if}
      {:else}
        <p class="customer-booking-flow__empty">Seleziona un posto disponibile per preparare il conto.</p>
      {/if}
      {#if error && stage === 'confirm'}
        <p class="customer-booking-flow__error">{error}</p>
      {/if}
    </section>
  </div>
</section>
