<script lang="ts">
  import { onMount } from 'svelte'
  import { searchCustomers } from '../../lib/services/customerService'
  import type { Customer } from '../../lib/types/customer'
  import CustomerSearchResults from './CustomerSearchResults.svelte'

  let {
    saving,
    onAssign,
    onCancel,
  }: {
    saving: boolean
    onAssign: (customer: Customer) => void | Promise<void>
    onCancel: () => void
  } = $props()

  let query = $state('')
  let customers: Customer[] = $state([])
  let selectedCustomer: Customer | null = $state(null)

  const loadCustomers = async () => {
    customers = await searchCustomers(query)
  }

  onMount(() => {
    loadCustomers()
  })
</script>

<section class="customer-picker" aria-label="Assegna cliente">
  <label>
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

  <CustomerSearchResults
    {customers}
    onSelect={(customer) => {
      selectedCustomer = customer
    }}
  />

  {#if selectedCustomer}
    <div class="selected-customer">
      <span>Cliente selezionato</span>
      <strong>{selectedCustomer.fullName}</strong>
    </div>
  {/if}

  <div class="customer-form-actions">
    <button
      type="button"
      disabled={!selectedCustomer || saving}
      onclick={() => selectedCustomer && onAssign(selectedCustomer)}
    >
      Assegna
    </button>
    <button type="button" disabled={saving} onclick={onCancel}>Annulla</button>
  </div>
</section>
