<script lang="ts">
  import { reservationTypeLabels } from '../../../lib/format/reservationLabels'
  import { getDefaultDailyPeriod, getDefaultSeasonalPeriod, isDateRangeValid } from '../../../lib/reservations/periodRules'
  import { businessConfig } from '../../../lib/config/appConfig'
  import type { OperatorBookingValidationResult } from '../../../lib/booking/operatorBookingService'
  import type { BeachItemAssignedCustomer } from '../../../lib/types/customer'
  import type { Reservation, ReservationInput, ReservationType } from '../../../lib/types/reservation'
  import ActionActivity from '../../loading/ActionActivity.svelte'

  let { itemId, assignedCustomer, reservation, accountId, saving, onValidate, onSave, onClose }: {
    itemId: string
    assignedCustomer: BeachItemAssignedCustomer
    reservation: Reservation | null
    accountId: string | null
    saving: boolean
    onValidate: (input: {
      reservationId?: string | null
      reservationType: ReservationType
      startDate: string
      endDate: string
      manualAmountCents?: number | null
    }) => Promise<OperatorBookingValidationResult>
    onSave: (reservationId: string | null, input: ReservationInput) => void | Promise<void>
    onClose: () => void
  } = $props()

  let loadedKey = $state('')
  let reservationType = $state<ReservationType>('daily')
  let startDate = $state('')
  let endDate = $state('')
  let calendarMonth = $state('')
  let dailySelectionPhase = $state<'start' | 'end'>('start')
  let error: string | null = $state(null)
  let validation: OperatorBookingValidationResult | null = $state(null)
  let validationLoading = $state(false)
  let validationToken = 0

  const monthNames = [
    'gennaio',
    'febbraio',
    'marzo',
    'aprile',
    'maggio',
    'giugno',
    'luglio',
    'agosto',
    'settembre',
    'ottobre',
    'novembre',
    'dicembre',
  ]
  const weekdayLabels = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

  const toDate = (date: string) => {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const toIsoDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDisplayDate = (date: string) => {
    if (!date) return '-'
    const [year, month, day] = date.split('-')
    return `${day}/${month}/${year}`
  }

  const setCalendarMonthFromDate = (date: string) => {
    if (date) calendarMonth = date.slice(0, 7)
  }

  const applyDefaults = (type: ReservationType) => {
    const period = type === 'seasonal' ? getDefaultSeasonalPeriod() : getDefaultDailyPeriod()
    startDate = period.startDate
    endDate = period.endDate
    setCalendarMonthFromDate(period.startDate)
    dailySelectionPhase = 'start'
  }

  const selectedPeriodLabel = $derived.by(() => {
    if (!startDate || !endDate) return 'Oggi'
    if (startDate === endDate) return formatDisplayDate(startDate)
    return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
  })

  const calendarTitle = $derived.by(() => {
    const date = calendarMonth ? toDate(`${calendarMonth}-01`) : toDate(startDate || getDefaultDailyPeriod().startDate)
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  })

  const calendarDays = $derived.by(() => {
    const base = calendarMonth ? toDate(`${calendarMonth}-01`) : toDate(startDate || getDefaultDailyPeriod().startDate)
    const firstOfMonth = new Date(base.getFullYear(), base.getMonth(), 1)
    const mondayOffset = (firstOfMonth.getDay() + 6) % 7
    const firstCell = new Date(firstOfMonth)
    firstCell.setDate(firstOfMonth.getDate() - mondayOffset)

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstCell)
      date.setDate(firstCell.getDate() + index)
      const iso = toIsoDate(date)
      const inMonth = date.getMonth() === base.getMonth()
      const day = date.getDay()
      return {
        iso,
        label: String(date.getDate()),
        inMonth,
        weekend: day === 0 || day === 6,
        selectedStart: iso === startDate,
        selectedEnd: iso === endDate && endDate !== startDate,
        inRange: Boolean(startDate && endDate && iso > startDate && iso < endDate),
      }
    })
  })

  const availabilityTone = $derived.by(() => {
    if (validationLoading) return 'checking'
    if (!validation) return 'unknown'
    return validation.valid ? 'available' : 'conflict'
  })

  const availabilityLabel = $derived.by(() => {
    if (validationLoading) return 'Verifica disponibilità'
    if (!validation) return 'Verifica disponibilità'
    if (validation.valid) return 'Disponibile'
    if (validation.errors.includes('unavailable_period')) return 'Conflitto disponibilità'
    return 'Verifica disponibilità'
  })

  const availabilityDetail = $derived.by(() => {
    const conflict = validation?.confirmability?.conflicts[0] ?? validation?.availability?.conflicts[0]
    if (!conflict) return validation?.valid ? 'Periodo libero per questo posto.' : 'Controllo locale sul periodo selezionato.'
    if (conflict.type === 'overlapping_reservation') return 'Periodo già occupato.'
    if (conflict.type === 'maintenance') return 'Posto in manutenzione.'
    if (conflict.type === 'active_lock') return 'Periodo bloccato da una richiesta attiva.'
    return conflict.message
  })

  const moveCalendarMonth = (delta: number) => {
    const base = calendarMonth ? toDate(`${calendarMonth}-01`) : toDate(startDate || getDefaultDailyPeriod().startDate)
    base.setMonth(base.getMonth() + delta)
    calendarMonth = toIsoDate(base).slice(0, 7)
  }

  const selectDailyDate = (date: string) => {
    if (dailySelectionPhase === 'start') {
      startDate = date
      endDate = date
      dailySelectionPhase = 'end'
      setCalendarMonthFromDate(date)
      return
    }

    if (date < startDate) {
      endDate = startDate
      startDate = date
    } else {
      endDate = date
    }
    dailySelectionPhase = 'start'
    setCalendarMonthFromDate(date)
  }

  const resetDailyRange = () => {
    const period = getDefaultDailyPeriod()
    startDate = period.startDate
    endDate = period.endDate
    dailySelectionPhase = 'start'
    setCalendarMonthFromDate(period.startDate)
  }

  $effect(() => {
    const nextKey = reservation?.id ?? `${itemId}:${assignedCustomer.customer.id}:new`
    if (nextKey === loadedKey) return
    loadedKey = nextKey
    reservationType = reservation?.reservationType ?? 'daily'
    if (reservation) {
      startDate = reservation.startDate
      endDate = reservation.endDate
      setCalendarMonthFromDate(reservation.startDate)
      dailySelectionPhase = 'start'
    } else {
      applyDefaults(reservationType)
    }
    error = null
  })

  $effect(() => {
    itemId
    assignedCustomer.customer.id
    reservation?.id
    reservationType
    startDate
    endDate

    if (!isDateRangeValid(startDate, endDate)) {
      validation = null
      return
    }

    const token = ++validationToken
    validationLoading = true
    onValidate({
      reservationId: reservation?.id ?? null,
      reservationType,
      startDate,
      endDate,
      manualAmountCents: null,
    })
      .then((result) => {
        if (token === validationToken) {
          validation = result
        }
      })
      .catch(() => {
        if (token === validationToken) {
          validation = null
        }
      })
      .finally(() => {
        if (token === validationToken) {
          validationLoading = false
        }
      })
  })

  const submit = async () => {
    if (!isDateRangeValid(startDate, endDate)) {
      error = 'Periodo non valido'
      return
    }
    const validationResult = await onValidate({
      reservationId: reservation?.id ?? null,
      reservationType,
      startDate,
      endDate,
      manualAmountCents: null,
    })
    validation = validationResult
    if (!validationResult.valid) {
      error = validationResult.errors.includes('unavailable_period')
        ? 'Periodo già occupato'
        : 'Verifica disponibilità non superata'
      return
    }
    await onSave(reservation?.id ?? null, {
      itemId,
      customerId: assignedCustomer.customer.id,
      assignmentId: assignedCustomer.assignment.id,
      accountId,
      reservationType,
      startDate,
      endDate,
    })
  }
</script>

<section class="inline-editor" aria-label="Periodo">
  <header class="inline-editor__header">
    <div>
      <strong>{reservation ? 'Modifica periodo' : 'Imposta periodo'}</strong>
      <span>{assignedCustomer.customer.fullName}</span>
    </div>
    <button type="button" onclick={onClose}>Annulla</button>
  </header>

  <div class="inline-editor__segment period-editor__segment">
    {#each ['daily', 'seasonal'] as type}
      <button type="button" class:active={reservationType === type} onclick={() => {
        reservationType = type as ReservationType
        applyDefaults(type as ReservationType)
      }}>{reservationTypeLabels[type as ReservationType]}</button>
    {/each}
  </div>

  <div class="period-editor__body">
    {#if reservationType === 'daily'}
      <div class="period-calendar" aria-label="Calendario giornaliero">
        <div class="period-calendar__nav">
          <button type="button" aria-label="Mese precedente" onclick={() => moveCalendarMonth(-1)}>&lt;</button>
          <div>
            <strong>{calendarTitle}</strong>
            <span>{selectedPeriodLabel}</span>
          </div>
          <button type="button" aria-label="Mese successivo" onclick={() => moveCalendarMonth(1)}>&gt;</button>
        </div>
        <div class="period-calendar__weekdays" aria-hidden="true">
          {#each weekdayLabels as weekday}
            <span>{weekday}</span>
          {/each}
        </div>
        <div class="period-calendar__days">
          {#each calendarDays as day}
            <button
              type="button"
              class:period-calendar__day--muted={!day.inMonth}
              class:period-calendar__day--weekend={day.weekend}
              class:period-calendar__day--range={day.inRange}
              class:period-calendar__day--selected={day.selectedStart || day.selectedEnd}
              onclick={() => selectDailyDate(day.iso)}
            >
              <span>{day.label}</span>
            </button>
          {/each}
        </div>
        <div class="period-calendar__footer">
          <span>{dailySelectionPhase === 'end' ? 'Scegli fine o salva il giorno singolo.' : 'Scegli il giorno di inizio.'}</span>
          <button type="button" onclick={resetDailyRange}>Oggi</button>
        </div>
      </div>
    {:else}
      <div class="inline-editor__field-grid period-editor__seasonal-fields">
        <label>Dal<input type="date" bind:value={startDate} /></label>
        <label>Al<input type="date" bind:value={endDate} /></label>
      </div>
    {/if}

    <aside class="period-editor__summary" aria-label="Riepilogo periodo">
      <span>Periodo selezionato</span>
      <strong>{selectedPeriodLabel}</strong>
      {#if reservationType === 'daily'}
        <small>Giornaliero · {businessConfig.daily.startLabel} - {businessConfig.daily.endLabel}</small>
      {:else}
        <small>Stagionale</small>
      {/if}
      <p class="inline-editor__hint">Il dovuto viene calcolato nel conto e resta modificabile.</p>
      <p class={`period-editor__availability period-editor__availability--${availabilityTone}`}>
        <strong>{availabilityLabel}</strong>
        <span>{availabilityDetail}</span>
      </p>
      {#if error}<p class="inline-editor__error">{error}</p>{/if}
      <div class="inline-editor__actions">
        <button type="button" disabled={saving || validation?.valid === false} onclick={submit}>
          {#if saving}
            <ActionActivity label="Salvataggio periodo" />
          {:else}
            Salva periodo
          {/if}
        </button>
      </div>
    </aside>
  </div>
</section>
