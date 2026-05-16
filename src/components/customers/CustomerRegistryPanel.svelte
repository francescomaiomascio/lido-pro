<script lang="ts">
  import { onMount } from 'svelte'
  import { formatEuroFromCents } from '../../lib/format/money'
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
  import CustomerAnagraficaForm from './CustomerAnagraficaForm.svelte'
  import CustomerProfilePanel from './CustomerProfilePanel.svelte'

  type RegistryTab = 'list' | 'new'
  type DetailMode = 'empty' | 'profile' | 'edit'

  let query = $state('')
  let customers: CustomerSearchSummary[] = $state([])
  let selectedCustomerId: string | null = $state(null)
  let selectedProfile: CustomerProfile | null = $state(null)
  let reservationHistory: CustomerReservationSummary[] = $state([])
  let activeTab: RegistryTab = $state('list')
  let detailMode: DetailMode = $state('empty')
  let saving = $state(false)
  let loading = $state(false)
  let message: string | null = $state(null)
  let error: string | null = $state(null)
  let historyExpanded = $state(false)

  const loadCustomers = async () => {
    customers = await searchCustomersWithSummary(query)
  }

  const loadProfile = async (customerId: string) => {
    loading = true
    error = null
    historyExpanded = false
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
      activeTab = 'list'
      detailMode = profile ? 'profile' : 'empty'
    } catch (loadError) {
      error = loadError instanceof Error ? loadError.message : 'Errore caricamento profilo cliente.'
    } finally {
      loading = false
    }
  }

  const startCreate = () => {
    selectedCustomerId = null
    selectedProfile = null
    reservationHistory = []
    activeTab = 'new'
    detailMode = 'empty'
    message = null
    error = null
  }

  const showList = () => {
    activeTab = 'list'
    detailMode = selectedProfile ? 'profile' : 'empty'
    message = null
    error = null
  }

  const clearSelection = () => {
    selectedCustomerId = null
    selectedProfile = null
    reservationHistory = []
    detailMode = 'empty'
    historyExpanded = false
  }

  const saveNewCustomer = async (input: CustomerInput) => {
    saving = true
    message = null
    error = null
    try {
      const customer = await createCustomer(input)
      await loadCustomers()
      await loadProfile(customer.id)
      activeTab = 'list'
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
      await loadCustomers()
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

  const getCustomerContact = (row: CustomerSearchSummary): string =>
    row.customer.phone || row.customer.email || 'Nessun recapito'

  const getCustomerStatusLabel = (row: CustomerSearchSummary): string =>
    row.status === 'open-balance'
      ? 'Saldo aperto'
      : row.status === 'active'
        ? 'Attivo'
        : 'In archivio'
</script>

<section class="settings-panel customer-registry-panel" aria-label="Clienti">
  <div class="settings-view-header settings-panel__header customer-registry-topbar">
    <h2>Clienti</h2>
    <div class="customer-registry-toolbar">
      <div class="customer-registry-tabs" role="tablist" aria-label="Navigazione clienti">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'list'}
          class:active={activeTab === 'list'}
          onclick={showList}
        >
          Lista
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'new'}
          class:active={activeTab === 'new'}
          onclick={startCreate}
        >
          Nuovo
        </button>
      </div>

      {#if activeTab === 'list'}
        <label class="customer-registry-search">
          <span>Cerca</span>
          <input
            value={query}
            placeholder="Nome, telefono o email"
            oninput={(event) => {
              query = event.currentTarget.value
              loadCustomers()
            }}
          />
        </label>
      {/if}
    </div>
  </div>

  <div class="customer-registry-layout customer-registry-shell" class:customer-registry-shell--new={activeTab === 'new'}>
    <aside class="customer-directory" aria-label="Lista clienti">
      <div class="customer-directory__head">
        <span>{customers.length} clienti</span>
        {#if selectedCustomerId}
          <button type="button" onclick={clearSelection}>Deseleziona</button>
        {/if}
      </div>

      <div class="customer-directory-list">
        {#each customers as row (row.customer.id)}
          <button
            type="button"
            class="customer-directory-row"
            class:active={row.customer.id === selectedCustomerId && activeTab === 'list'}
            onclick={() => loadProfile(row.customer.id)}
          >
            <span class="customer-directory-row__main">
              <strong>{row.customer.fullName}</strong>
              <small>{getCustomerContact(row)}</small>
            </span>
            <span class="customer-directory-row__meta">
              <span>{row.currentActivityLabel}</span>
              <strong>{formatEuroFromCents(row.balanceAmountCents)}</strong>
            </span>
            <em class:warning={row.status === 'open-balance'}>{getCustomerStatusLabel(row)}</em>
          </button>
        {:else}
          <p class="empty-customer">Nessun cliente trovato.</p>
        {/each}
      </div>
    </aside>

    <section class="customer-registry-detail customer-detail" aria-label="Scheda cliente">
      {#if activeTab === 'new'}
        <div class="customer-detail-create">
          <div class="settings-subheader">
            <span>Nuovo cliente</span>
            <h3>Anagrafica</h3>
            <p>Inserisci i dati essenziali. La scheda verrà aperta dopo il salvataggio.</p>
          </div>
          <CustomerAnagraficaForm
            {saving}
            onSave={saveNewCustomer}
            onCancel={showList}
          />
        </div>
      {:else if selectedProfile}
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
        />
      {:else if loading}
        <div class="settings-empty-detail customer-detail-empty">
          <h3>Caricamento cliente</h3>
          <p>Preparazione scheda anagrafica.</p>
        </div>
      {:else}
        <div class="settings-empty-detail customer-detail-empty">
          <h3>Seleziona un cliente</h3>
          <p>La scheda anagrafica, l'attivita recente e il conto compariranno qui.</p>
        </div>
      {/if}
    </section>
  </div>

  {#if message}
    <p class="inline-confirmation">{message}</p>
  {/if}
  {#if error}
    <p class="form-error">{error}</p>
  {/if}
</section>
