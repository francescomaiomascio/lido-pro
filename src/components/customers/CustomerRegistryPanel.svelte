<script lang="ts">
  import { onMount } from 'svelte'
  import {
    getCustomerProfile,
    getCustomerReservationHistory,
    searchCustomersWithSummary,
  } from '../../lib/services/customerProfileService'
  import { createCustomer, updateCustomer } from '../../lib/services/customerService'
  import type { CustomerInput } from '../../lib/types/customer'
  import type {
    CustomerProfile,
    CustomerReservationSummary,
    CustomerSearchSummary,
  } from '../../lib/types/customerProfile'
  import InlineLoadingState from '../loading/InlineLoadingState.svelte'
  import BookingRequestInbox from './BookingRequestInbox.svelte'
  import CustomerAnagraficaForm from './CustomerAnagraficaForm.svelte'
  import CustomerBookingFlow from './CustomerBookingFlow.svelte'
  import CustomerEmptyState from './CustomerEmptyState.svelte'
  import CustomerListPane from './CustomerListPane.svelte'
  import CustomerProfilePanel from './CustomerProfilePanel.svelte'
  import type { CustomerFilterId } from './customerWorkspaceTypes'
  import type { CustomerBookingConfirmResult } from '../../lib/booking/customerBookingService'

  type DetailMode = 'empty' | 'profile' | 'edit'
  type WorkspaceMode = 'customers' | 'requests'

  let {
    onOpenBeachItem,
    onBookingCreated,
    onInboxChanged,
  }: {
    onOpenBeachItem?: (itemId: string) => void | Promise<void>
    onBookingCreated?: (result: CustomerBookingConfirmResult) => void | Promise<void>
    onInboxChanged?: () => void | Promise<void>
  } = $props()

  let workspaceMode: WorkspaceMode = $state('customers')
  let query = $state('')
  let activeFilter: CustomerFilterId = $state('all')
  let customers: CustomerSearchSummary[] = $state([])
  let selectedCustomerId: string | null = $state(null)
  let selectedProfile: CustomerProfile | null = $state(null)
  let reservationHistory: CustomerReservationSummary[] = $state([])
  let detailMode: DetailMode = $state('empty')
  let creating = $state(false)
  let loadingList = $state(false)
  let loadingProfile = $state(false)
  let saving = $state(false)
  let bookingFlowOpen = $state(false)
  let message: string | null = $state(null)
  let error: string | null = $state(null)
  let historyExpanded = $state(false)

  const filteredCustomers = $derived.by(() =>
    customers.filter((row) => {
      if (activeFilter === 'active') {
        return row.status === 'active' || row.status === 'open-balance'
      }

      if (activeFilter === 'with-booking') {
        return row.hasActiveReservation
      }

      if (activeFilter === 'open-account') {
        return row.hasOpenAccount || row.balanceAmountCents > 0
      }

      return true
    }),
  )

  const loadCustomers = async (nextQuery = query) => {
    loadingList = true
    try {
      customers = await searchCustomersWithSummary(nextQuery)
    } finally {
      loadingList = false
    }
  }

  const loadProfile = async (customerId: string) => {
    loadingProfile = true
    error = null
    message = null
    historyExpanded = false
    bookingFlowOpen = false
    creating = false
    selectedCustomerId = customerId
    selectedProfile = null
    reservationHistory = []
    detailMode = 'empty'
    try {
      const [profile, history] = await Promise.all([
        getCustomerProfile(customerId),
        getCustomerReservationHistory(customerId),
      ])
      selectedProfile = profile
      reservationHistory = history
      detailMode = profile ? 'profile' : 'empty'
    } catch (loadError) {
      error = loadError instanceof Error ? loadError.message : 'Errore caricamento profilo cliente.'
    } finally {
      loadingProfile = false
    }
  }

  const refreshProfile = async (customerId: string) => {
    loadingProfile = true
    try {
      const [profile, history] = await Promise.all([
        getCustomerProfile(customerId),
        getCustomerReservationHistory(customerId),
      ])
      selectedProfile = profile
      reservationHistory = history
      detailMode = profile ? 'profile' : 'empty'
    } catch (loadError) {
      error = loadError instanceof Error ? loadError.message : 'Errore caricamento profilo cliente.'
    } finally {
      loadingProfile = false
    }
  }

  const handleQueryChange = (nextQuery: string) => {
    query = nextQuery
    void loadCustomers(nextQuery).catch(() => {
      error = 'Errore caricamento clienti.'
    })
  }

  const startCreate = () => {
    workspaceMode = 'customers'
    creating = true
    selectedCustomerId = null
    selectedProfile = null
    reservationHistory = []
    detailMode = 'empty'
    bookingFlowOpen = false
    message = null
    error = null
  }

  const closeCreate = () => {
    creating = false
    detailMode = selectedProfile ? 'profile' : 'empty'
  }

  const startBooking = () => {
    if (!selectedProfile) {
      return
    }
    bookingFlowOpen = true
    workspaceMode = 'customers'
    detailMode = 'profile'
    message = null
    error = null
  }

  const openRequests = () => {
    workspaceMode = 'requests'
    creating = false
    bookingFlowOpen = false
    message = null
    error = null
  }

  const openCustomers = () => {
    workspaceMode = 'customers'
    message = null
    error = null
  }

  const handleInboxChanged = async () => {
    await loadCustomers(query)
    if (selectedCustomerId) {
      await refreshProfile(selectedCustomerId)
    }
    await onInboxChanged?.()
  }

  const closeBooking = () => {
    bookingFlowOpen = false
  }

  const handleBookingCompleted = async (result: CustomerBookingConfirmResult) => {
    await onBookingCreated?.(result)
    await loadCustomers(query)
    await refreshProfile(result.reservation.customerId)
    bookingFlowOpen = true
    message = 'Prenotazione creata'
  }

  const saveNewCustomer = async (input: CustomerInput) => {
    saving = true
    message = null
    error = null
    try {
      const customer = await createCustomer(input)
      query = ''
      activeFilter = 'all'
      await loadCustomers('')
      await loadProfile(customer.id)
      creating = false
      message = 'Cliente salvato'
    } catch (saveError) {
      error = saveError instanceof Error ? saveError.message : 'Errore durante il salvataggio.'
    } finally {
      saving = false
    }
  }

  const saveExistingCustomer = async (input: CustomerInput) => {
    if (!selectedProfile) {
      return
    }

    saving = true
    message = null
    error = null
    try {
      const customer = await updateCustomer(selectedProfile.customer.id, input)
      await loadCustomers(query)
      await loadProfile(customer.id)
      detailMode = 'profile'
      message = 'Cliente salvato'
    } catch (saveError) {
      error = saveError instanceof Error ? saveError.message : 'Errore durante il salvataggio.'
    } finally {
      saving = false
    }
  }

  onMount(() => {
    loadCustomers().catch(() => {
      error = 'Errore caricamento clienti.'
    })
  })
</script>

<section class="settings-panel customer-registry-panel customers-workspace" aria-label="Clienti">
  <header class="customers-page-header">
    <div>
      <h2>Clienti</h2>
      <p>Anagrafiche, contatti e operazioni collegate.</p>
    </div>
    <div class="customers-page-actions">
      <div class="customers-page-tabs" aria-label="Vista Clienti">
        <button type="button" class:active={workspaceMode === 'customers'} onclick={openCustomers}>Clienti</button>
        <button type="button" class:active={workspaceMode === 'requests'} onclick={openRequests}>Richieste</button>
      </div>
      <button type="button" class="button-secondary" onclick={startCreate}>Nuovo cliente</button>
    </div>
  </header>

  {#if workspaceMode === 'requests'}
    <BookingRequestInbox onInboxChanged={handleInboxChanged} />
  {:else}
    <div class="customers-shell">
      <CustomerListPane
        customers={filteredCustomers}
        {query}
        {activeFilter}
        {selectedCustomerId}
        loading={loadingList}
        onQueryChange={handleQueryChange}
        onFilterChange={(filter) => (activeFilter = filter)}
        onSelect={loadProfile}
        onCreate={startCreate}
      />

      <section class="customer-profile-pane" aria-label="Scheda cliente">
        {#if creating}
          <div class="customer-detail-create">
            <div class="customer-detail-create__heading">
              <span>Creazione cliente</span>
              <h3>Nuova anagrafica</h3>
              <p>Salva nome e recapiti. Posto, prenotazioni e conto si collegano dalla scheda operativa.</p>
            </div>
            <CustomerAnagraficaForm {saving} onSave={saveNewCustomer} onCancel={closeCreate} />
          </div>
        {:else if selectedProfile}
          {#if bookingFlowOpen}
            <CustomerBookingFlow
              profile={selectedProfile}
              onClose={closeBooking}
              onCompleted={handleBookingCompleted}
              {onOpenBeachItem}
            />
          {/if}
          <CustomerProfilePanel
            profile={selectedProfile}
            fullReservationHistory={reservationHistory}
            {saving}
            editing={detailMode === 'edit'}
            {historyExpanded}
            variant="embedded"
            onEdit={() => (detailMode = 'edit')}
            onCancelEdit={() => (detailMode = 'profile')}
            onSave={saveExistingCustomer}
            onToggleHistory={() => (historyExpanded = !historyExpanded)}
            onStartBooking={startBooking}
          />
        {:else if loadingProfile}
          <InlineLoadingState
            compact
            eyebrow="Cliente"
            title="Caricamento profilo"
            message="Preparazione scheda anagrafica, storico e riepilogo conto."
            rows={3}
          />
        {:else}
          <div class="customer-profile-pane__empty">
            <CustomerEmptyState
              eyebrow="Workspace cliente"
              title="Scegli un cliente dalla lista"
              message="Qui trovi contatti, posto assegnato, prenotazioni, conto e storico operativo."
            />
            <div class="customer-disabled-shortcuts" aria-label="Collegamenti disponibili">
              <span>Collegamenti della scheda</span>
              <div>
                <span>Prenotazioni</span>
                <span>Conto</span>
                <span>Registro</span>
                <span>Spiaggia</span>
              </div>
            </div>
          </div>
        {/if}
      </section>
    </div>
  {/if}

  {#if message}
    <p class="inline-confirmation">{message}</p>
  {/if}
  {#if error}
    <p class="form-error">{error}</p>
  {/if}
</section>
