<script lang="ts">
  import type { CustomerSearchSummary } from '../../lib/types/customerProfile'
  import CustomerEmptyState from './CustomerEmptyState.svelte'
  import CustomerListItem from './CustomerListItem.svelte'
  import type { CustomerFilterId } from './customerWorkspaceTypes'

  let {
    customers,
    query,
    activeFilter,
    selectedCustomerId,
    loading,
    onQueryChange,
    onFilterChange,
    onSelect,
    onCreate,
  }: {
    customers: CustomerSearchSummary[]
    query: string
    activeFilter: CustomerFilterId
    selectedCustomerId: string | null
    loading: boolean
    onQueryChange: (query: string) => void
    onFilterChange: (filter: CustomerFilterId) => void
    onSelect: (customerId: string) => void
    onCreate: () => void
  } = $props()

  const filterOptions: Array<{ id: CustomerFilterId; label: string }> = [
    { id: 'all', label: 'Tutti' },
    { id: 'active', label: 'Attivi' },
    { id: 'with-booking', label: 'Prenotati' },
    { id: 'open-account', label: 'Conto aperto' },
  ]
  const hasSearch = $derived(query.trim().length > 0)
  const isFiltered = $derived(hasSearch || activeFilter !== 'all')
</script>

<aside class="customer-list-pane" aria-label="Lista clienti">
  <div class="customer-list-pane__search">
    <label>
      <span>Archivio clienti</span>
      <input
        value={query}
        placeholder="Cerca per nome, telefono o email"
        oninput={(event) => onQueryChange(event.currentTarget.value)}
      />
    </label>
  </div>

  <div class="customer-list-pane__meta">
    <span>{customers.length} risultati</span>
    <div class="customer-list-pane__filters" aria-label="Filtro clienti">
      {#each filterOptions as option}
        <button
          type="button"
          class:active={activeFilter === option.id}
          onclick={() => onFilterChange(option.id)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="customer-list-pane__body">
    {#if loading}
      <CustomerEmptyState
        compact
        eyebrow="Clienti"
        title="Caricamento lista"
        message="Preparazione anagrafiche e collegamenti operativi."
      />
    {:else if customers.length > 0}
      <div class="customer-list-pane__rows">
        {#each customers as row (row.customer.id)}
          <CustomerListItem
            {row}
            selected={row.customer.id === selectedCustomerId}
            onSelect={() => onSelect(row.customer.id)}
          />
        {/each}
      </div>
    {:else if isFiltered}
      <CustomerEmptyState
        compact
        eyebrow="Nessun risultato"
        title="Nessun cliente trovato"
        message="Nessun cliente corrisponde alla ricerca o al filtro attivo."
      />
    {:else}
      <CustomerEmptyState
        compact
        eyebrow="Lista clienti"
        title="Nessun cliente"
        message="Crea un'anagrafica per collegare posto, prenotazioni, conto e attività."
        actionLabel="Nuovo cliente"
        onAction={onCreate}
      />
    {/if}
  </div>
</aside>
