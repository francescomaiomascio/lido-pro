<script lang="ts">
  import { onMount } from 'svelte'
  import { normalizeCustomerInput, validateCustomerInput } from '../../../lib/customers/customerValidation'
  import { createCustomer, searchCustomers } from '../../../lib/services/customerService'
  import type { BeachItemAssignedCustomer, Customer } from '../../../lib/types/customer'

  let {
    assignedCustomer: _assignedCustomer = null,
    saving,
    onAssign,
    onRemove: _onRemove,
    onClose,
  }: {
    assignedCustomer?: BeachItemAssignedCustomer | null
    saving: boolean
    onAssign: (customerId: string) => void | Promise<void>
    onRemove?: () => void | Promise<void>
    onClose: () => void
  } = $props()

  let query = $state('')
  let customers: Customer[] = $state([])
  let mode: 'search' | 'new' = $state('search')
  let fullName = $state('')
  let phone = $state('')
  let email = $state('')
  let error: string | null = $state(null)

  const loadCustomers = async () => {
    customers = await searchCustomers(query)
  }

  const createAndAssign = async () => {
    const input = normalizeCustomerInput({ fullName, phone, email })
    const validationError = validateCustomerInput(input)
    if (validationError) {
      error = validationError
      return
    }

    error = null
    const customer = await createCustomer(input)
    await onAssign(customer.id)
  }

  onMount(loadCustomers)
</script>

<section class="inline-editor customer-picker" aria-label="Assegna cliente">
  <div class="customer-picker__toolbar">
    <div class="customer-picker__search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7"></circle>
        <path d="m20 20-3.5-3.5"></path>
      </svg>
      <label for="customer-picker-search">Cerca cliente</label>
      <input
        id="customer-picker-search"
        value={query}
        placeholder="Cerca"
        oninput={(event) => {
          query = event.currentTarget.value
          loadCustomers()
        }}
      />
    </div>
    <button type="button" class="customer-picker__add" onclick={() => (mode = mode === 'new' ? 'search' : 'new')} aria-label="Nuovo cliente">+</button>
    <button type="button" class="customer-picker__cancel" onclick={onClose}>Annulla</button>
  </div>

  {#if mode === 'new'}
    <form
      class="customer-picker__new"
      onsubmit={(event) => {
        event.preventDefault()
        createAndAssign()
      }}
    >
      <input bind:value={fullName} placeholder="Nome e cognome" autocomplete="name" />
      <input bind:value={phone} placeholder="Telefono" autocomplete="tel" inputmode="tel" />
      <input bind:value={email} placeholder="Email" autocomplete="email" />
      {#if error}<p class="inline-editor__error">{error}</p>{/if}
      <div>
        <button type="submit" disabled={saving}>Crea e assegna</button>
        <button type="button" disabled={saving} onclick={() => (mode = 'search')}>Lista</button>
      </div>
    </form>
  {:else}
    <div class="customer-picker__results" role="listbox" aria-label="Clienti">
      {#each customers as customer}
        <button
          type="button"
          class="customer-picker__row"
          role="option"
          aria-selected="false"
          disabled={saving}
          onclick={() => onAssign(customer.id)}
        >
          <strong>{customer.fullName}</strong>
        </button>
      {:else}
        <p class="inline-editor__empty">Nessun cliente trovato.</p>
      {/each}
    </div>
  {/if}
</section>
