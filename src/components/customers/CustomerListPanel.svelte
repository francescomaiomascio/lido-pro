<script lang="ts">
  import { onMount } from 'svelte'
  import {
    createCustomer,
    searchCustomers,
    updateCustomer,
  } from '../../lib/services/customerService'
  import type { Customer, CustomerInput } from '../../lib/types/customer'
  import CustomerForm from './CustomerForm.svelte'

  type Mode = 'list' | 'new' | 'edit'

  let query = $state('')
  let customers: Customer[] = $state([])
  let selectedCustomer: Customer | null = $state(null)
  let mode: Mode = $state('list')
  let saving = $state(false)
  let message: string | null = $state(null)
  let error: string | null = $state(null)

  const loadCustomers = async () => {
    customers = await searchCustomers(query)
  }

  const saveNewCustomer = async (input: CustomerInput) => {
    saving = true
    message = null
    error = null

    try {
      await createCustomer(input)
      await loadCustomers()
      mode = 'list'
      message = 'Cliente salvato'
    } catch (saveError: unknown) {
      error = saveError instanceof Error ? saveError.message : 'Errore durante il salvataggio.'
    } finally {
      saving = false
    }
  }

  const saveExistingCustomer = async (input: CustomerInput) => {
    if (!selectedCustomer) {
      return
    }

    saving = true
    message = null
    error = null

    try {
      await updateCustomer(selectedCustomer.id, input)
      await loadCustomers()
      mode = 'list'
      selectedCustomer = null
      message = 'Cliente salvato'
    } catch (saveError: unknown) {
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

<section class="settings-panel customer-list-panel" aria-label="Clienti">
  <div class="settings-view-header settings-panel__header">
    <div>
      <h2>Clienti</h2>
      <p>Rubrica locale dei clienti. Prenotazioni e assegnazioni restano nel pannello operativo.</p>
    </div>
    <button
      type="button"
      class="button-primary"
      onclick={() => {
        selectedCustomer = null
        mode = 'new'
      }}
    >
      Nuovo cliente
    </button>
  </div>

  <div class="customer-management-layout">
    <div class="customer-directory">
    <label class="customer-list-search">
      Cerca cliente
      <input
        value={query}
        placeholder="Nome o telefono"
        oninput={(event) => {
          query = event.currentTarget.value
          loadCustomers()
        }}
      />
    </label>

    <div class="customer-list-results">
      {#each customers as customer (customer.id)}
        <article class="customer-list-row">
          <div>
            <strong>{customer.fullName}</strong>
            <span>{customer.phone || customer.email || 'Nessun recapito'}</span>
            {#if customer.notes}
              <small>{customer.notes}</small>
            {/if}
          </div>
          <button
            type="button"
            onclick={() => {
              selectedCustomer = customer
              mode = 'edit'
            }}
          >
            Modifica
          </button>
        </article>
      {:else}
        <p class="empty-customer">Nessun cliente trovato.</p>
      {/each}
    </div>
    </div>

    <aside class="customer-editor-panel" aria-label={mode === 'edit' ? 'Modifica cliente' : 'Nuovo cliente'}>
      {#if mode === 'new'}
        <div class="settings-subheader">
          <h3>Nuovo cliente</h3>
          <p>Inserisci solo i dati anagrafici supportati dalla rubrica.</p>
        </div>
        <CustomerForm
          {saving}
          onSave={saveNewCustomer}
          onCancel={() => {
            mode = 'list'
            error = null
          }}
        />
      {:else if mode === 'edit' && selectedCustomer}
        <div class="settings-subheader">
          <h3>Modifica cliente</h3>
          <p>{selectedCustomer.fullName}</p>
        </div>
        <CustomerForm
          customer={selectedCustomer}
          {saving}
          onSave={saveExistingCustomer}
          onCancel={() => {
            mode = 'list'
            selectedCustomer = null
            error = null
          }}
        />
      {:else}
        <div class="settings-empty-detail">
          <h3>Nessun cliente selezionato</h3>
          <p>Seleziona un cliente dalla lista oppure crea una nuova anagrafica.</p>
        </div>
      {/if}
    </aside>
  </div>

  {#if message}
    <p class="inline-confirmation">{message}</p>
  {/if}

  {#if error}
    <p class="form-error">{error}</p>
  {/if}
</section>
