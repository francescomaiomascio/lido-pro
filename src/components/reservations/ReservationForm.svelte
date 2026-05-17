<script lang="ts">
  import { reservationTypeLabels } from '../../lib/format/reservationLabels'
  import {
    getDefaultDailyPeriod,
    getDefaultSeasonalPeriod,
    isDateRangeValid,
  } from '../../lib/reservations/periodRules'
  import type { Reservation, ReservationInput, ReservationType } from '../../lib/types/reservation'
  import ActionActivity from '../loading/ActionActivity.svelte'

  let {
    reservation = null,
    itemId,
    customerId,
    assignmentId = null,
    accountId = null,
    defaultReservationType = 'daily',
    customerName,
    itemCode,
    saving,
    onSave,
    onCancel,
  }: {
    reservation?: Reservation | null
    itemId: string
    customerId: string
    assignmentId?: string | null
    accountId?: string | null
    defaultReservationType?: ReservationType
    customerName: string
    itemCode: string
    saving: boolean
    onSave: (input: ReservationInput) => void | Promise<void>
    onCancel: () => void
  } = $props()

  let loadedReservationId = $state<string | null>(null)
  let reservationType: ReservationType = $state('daily')
  let startDate = $state('')
  let endDate = $state('')
  let notes = $state('')
  let error: string | null = $state(null)

  const applyTypeDefaults = (type: ReservationType) => {
    const period = type === 'seasonal' ? getDefaultSeasonalPeriod() : getDefaultDailyPeriod()
    startDate = period.startDate
    endDate = period.endDate
  }

  $effect(() => {
    const nextReservationId = reservation?.id ?? null

    if (nextReservationId === loadedReservationId) {
      return
    }

    loadedReservationId = nextReservationId
    reservationType = reservation?.reservationType ?? defaultReservationType

    if (reservation) {
      startDate = reservation.startDate
      endDate = reservation.endDate
      notes = reservation.notes ?? ''
    } else {
      applyTypeDefaults(reservationType)
      notes = ''
    }

    error = null
  })

  const submit = () => {
    if (!isDateRangeValid(startDate, endDate)) {
      error = 'Periodo non valido'
      return
    }

    error = null
    onSave({
      itemId,
      customerId,
      assignmentId,
      accountId,
      reservationType,
      startDate,
      endDate,
      notes,
    })
  }
</script>

<form
  class="reservation-form"
  onsubmit={(event) => {
    event.preventDefault()
    submit()
  }}
>
  <dl class="readonly-context">
    <div><dt>Posto</dt><dd>{itemCode}</dd></div>
    <div><dt>Cliente</dt><dd>{customerName}</dd></div>
  </dl>

  <fieldset class="account-type-field">
    <legend>Tipo prenotazione</legend>
    <div class="assignment-type">
      <button
        type="button"
        class:active={reservationType === 'daily'}
        onclick={() => {
          reservationType = 'daily'
          applyTypeDefaults('daily')
        }}
      >
        {reservationTypeLabels.daily}
      </button>
      <button
        type="button"
        class:active={reservationType === 'seasonal'}
        onclick={() => {
          reservationType = 'seasonal'
          applyTypeDefaults('seasonal')
        }}
      >
        {reservationTypeLabels.seasonal}
      </button>
    </div>
  </fieldset>

  <div class="date-fields">
    <label>
      Dal
      <input type="date" bind:value={startDate} />
    </label>
    <label>
      Al
      <input type="date" bind:value={endDate} />
    </label>
  </div>

  <label>
    Note
    <textarea bind:value={notes} placeholder="Es. arriva al mattino, confermato al telefono"></textarea>
  </label>

  {#if error}
    <p class="form-error">{error}</p>
  {/if}

  <div class="customer-form-actions">
    <button type="submit" disabled={saving}>
      {#if saving}
        <ActionActivity label="Salvataggio prenotazione" />
      {:else}
        Salva prenotazione
      {/if}
    </button>
    <button type="button" disabled={saving} onclick={onCancel}>Annulla</button>
  </div>
</form>
