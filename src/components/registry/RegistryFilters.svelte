<script lang="ts">
  import { accountStatusLabels } from '../../lib/format/accountLabels'
  import { reservationStatusLabels, reservationTypeLabels } from '../../lib/format/reservationLabels'
  import {
    createDefaultRegistryFilters,
    type RegistryFilters,
  } from '../../lib/state/registryFilters'
  import type { AccountStatus } from '../../lib/types/account'
  import type { ReservationStatus, ReservationType } from '../../lib/types/reservation'

  let {
    filters,
    onChange,
    onReset,
  }: {
    filters: RegistryFilters
    onChange: (filters: RegistryFilters) => void
    onReset?: () => void
  } = $props()

  let advancedOpen = $state(false)

  const update = (patch: Partial<RegistryFilters>) => {
    onChange({
      ...filters,
      ...patch,
    })
  }

  const reset = () => {
    if (onReset) {
      onReset()
      return
    }
    onChange(createDefaultRegistryFilters())
  }

  const reservationTypes: ReservationType[] = ['daily', 'seasonal']
  const reservationStatuses: ReservationStatus[] = ['draft', 'active', 'completed', 'cancelled']
  const accountStatuses: AccountStatus[] = ['open', 'partial', 'paid', 'cancelled']

  const applyQuickView = (view: 'all' | 'open-balance' | 'paid' | 'active') => {
    update({
      accountStatus: 'all',
      reservationStatus: view === 'active' ? 'active' : filters.reservationStatus === 'active' ? 'all' : filters.reservationStatus,
      onlyOpenBalance: view === 'open-balance',
      onlyPaid: view === 'paid',
      onlyActiveReservations: view === 'active',
    })
  }

  const quickView = $derived.by(() => {
    if (filters.onlyOpenBalance) return 'open-balance'
    if (filters.onlyPaid) return 'paid'
    if (filters.onlyActiveReservations || filters.reservationStatus === 'active') return 'active'
    return 'all'
  })
</script>

<section class="registry-filters" aria-label="Filtri registro">
  <div class="registry-filters__bar">
    <label>
      Anno
      <input
        type="number"
        min="2020"
        max="2100"
        value={filters.year}
        oninput={(event) => update({ year: Number(event.currentTarget.value) || filters.year })}
      />
    </label>

    <label>
      Cerca
      <input
        value={filters.customerQuery}
        placeholder="Cliente, telefono"
        oninput={(event) => update({ customerQuery: event.currentTarget.value, customerId: null })}
      />
    </label>

    <label>
      Scenario
      <select
        value={quickView}
        onchange={(event) => applyQuickView(event.currentTarget.value as 'all' | 'open-balance' | 'paid' | 'active')}
      >
        <option value="all">Tutti</option>
        <option value="open-balance">Da incassare</option>
        <option value="paid">Incassati</option>
        <option value="active">Prenotazioni attive</option>
      </select>
    </label>

    <div class="registry-filters__actions">
      <button type="button" class="button-secondary" onclick={() => (advancedOpen = !advancedOpen)}>
        Avanzati
      </button>
      <button type="button" class="button-ghost" onclick={reset}>Reset</button>
    </div>
  </div>

  {#if advancedOpen}
    <div class="registry-filters__advanced">
      <div class="registry-filters__advanced-head">
        <strong>Ricerca strutturata</strong>
        <span>Periodo, posto e stati amministrativi.</span>
      </div>

      <div class="registry-filters__grid">
        <label>
          Dal
          <input
            type="date"
            value={filters.dateFrom}
            oninput={(event) => update({ dateFrom: event.currentTarget.value })}
          />
        </label>

        <label>
          Al
          <input
            type="date"
            value={filters.dateTo}
            oninput={(event) => update({ dateTo: event.currentTarget.value })}
          />
        </label>

        <label>
          Posto
          <input
            value={filters.itemQuery}
            placeholder="P1-03, O2..."
            oninput={(event) => update({ itemQuery: event.currentTarget.value, itemId: null })}
          />
        </label>

        <label>
          Tipo
          <select
            value={filters.reservationType}
            onchange={(event) =>
              update({ reservationType: event.currentTarget.value as RegistryFilters['reservationType'] })}
          >
            <option value="all">Tutti</option>
            {#each reservationTypes as type}
              <option value={type}>{reservationTypeLabels[type]}</option>
            {/each}
          </select>
        </label>

        <label>
          Stato prenotazione
          <select
            value={filters.reservationStatus}
            onchange={(event) =>
              update({ reservationStatus: event.currentTarget.value as RegistryFilters['reservationStatus'] })}
          >
            <option value="all">Tutte</option>
            {#each reservationStatuses as status}
              <option value={status}>{reservationStatusLabels[status]}</option>
            {/each}
          </select>
        </label>

        <label>
          Stato conto
          <select
            value={filters.accountStatus}
            onchange={(event) =>
              update({ accountStatus: event.currentTarget.value as RegistryFilters['accountStatus'] })}
          >
            <option value="all">Tutti</option>
            {#each accountStatuses as status}
              <option value={status}>{accountStatusLabels[status]}</option>
            {/each}
          </select>
        </label>
      </div>
    </div>
  {/if}
</section>
