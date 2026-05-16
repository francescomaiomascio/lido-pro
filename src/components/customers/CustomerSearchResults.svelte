<script lang="ts">
  import type { Customer } from '../../lib/types/customer'

  let {
    customers,
    onSelect,
  }: {
    customers: Customer[]
    onSelect: (customer: Customer) => void
  } = $props()
</script>

<div class="customer-results">
  {#each customers as customer (customer.id)}
    <button type="button" class="customer-result" onclick={() => onSelect(customer)}>
      <strong>{customer.fullName}</strong>
      <span>{customer.phone || customer.email || 'Nessun recapito'}</span>
    </button>
  {:else}
    <p>Nessun cliente trovato.</p>
  {/each}
</div>
