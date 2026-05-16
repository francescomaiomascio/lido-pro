<script lang="ts">
  import CustomerPicker from './CustomerPicker.svelte'
  import CustomerSummary from './CustomerSummary.svelte'
  import type {
    BeachItemAssignedCustomer,
    Customer,
  } from '../../lib/types/customer'

  let {
    assignedCustomer,
    saving,
    onAssignCustomer,
    onUnassignCustomer,
  }: {
    assignedCustomer: BeachItemAssignedCustomer | null
    saving: boolean
    onAssignCustomer: (customerId: string) => void | Promise<void>
    onUnassignCustomer: () => void | Promise<void>
  } = $props()

  type Mode = 'summary' | 'picker'

  let mode: Mode = $state('summary')

  const closeEditor = () => {
    mode = 'summary'
  }

  const assign = async (customer: Customer) => {
    await onAssignCustomer(customer.id)
    closeEditor()
  }
</script>

<section class="customer-assignment-panel" aria-label="Cliente assegnato">
  <div class="section-heading">
    <h3>Cliente</h3>
  </div>

  {#if mode === 'picker'}
    <CustomerPicker
      {saving}
      onAssign={assign}
      onCancel={closeEditor}
    />
  {:else if assignedCustomer}
    <CustomerSummary {assignedCustomer} />
    <div class="customer-actions">
      <button type="button" disabled={saving} onclick={() => (mode = 'picker')}>Cambia cliente</button>
      <button type="button" disabled={saving} onclick={onUnassignCustomer}>Rimuovi cliente</button>
    </div>
  {:else}
    <p class="empty-customer">Nessun cliente assegnato</p>
    <div class="customer-actions">
      <button type="button" disabled={saving} onclick={() => (mode = 'picker')}>Assegna cliente</button>
    </div>
    <p class="helper-text">Nessun cliente trovato? Crea un cliente da Menu > Clienti.</p>
  {/if}
</section>
