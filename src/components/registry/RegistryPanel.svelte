<script lang="ts">
  import { onMount } from 'svelte'
  import {
    createDefaultRegistryFilters,
    type OpenRegistryRequest,
    type RegistryFilters,
  } from '../../lib/state/registryFilters'
  import { calculateRegistrySummary, getRegistryRecords } from '../../lib/services/registryService'
  import type { RegistryRecord, RegistrySummary } from '../../lib/types/registry'
  import InlineLoadingState from '../loading/InlineLoadingState.svelte'
  import RegistryFiltersPanel from './RegistryFilters.svelte'
  import RegistryInsights from './RegistryInsights.svelte'
  import RegistryRecordDetail from './RegistryRecordDetail.svelte'
  import RegistrySummaryStrip from './RegistrySummaryStrip.svelte'
  import RegistryTable from './RegistryTable.svelte'

  type RegistryViewMode = 'all' | 'accounts' | 'cash' | 'attention'

  let {
    openRequest = null,
  }: {
    openRequest?: OpenRegistryRequest | null
  } = $props()

  let filters: RegistryFilters = $state(createDefaultRegistryFilters())
  let records: RegistryRecord[] = $state([])
  let summary: RegistrySummary = $state({
    totalReservations: 0,
    totalCustomers: 0,
    totalDueCents: 0,
    totalPaidCents: 0,
    totalBalanceCents: 0,
    openAccounts: 0,
    paidAccounts: 0,
    partialAccounts: 0,
  })
  let selectedRecord: RegistryRecord | null = $state(null)
  let loading = $state(false)
  let handledRequestAt = $state(0)
  let viewMode: RegistryViewMode = $state('all')

  const viewRecords = $derived.by(() => {
    if (viewMode === 'accounts') {
      return records.filter((record) => record.accountStatus !== null)
    }

    if (viewMode === 'cash') {
      return records.filter((record) => record.paidAmountCents > 0 || record.balanceAmountCents > 0)
    }

    if (viewMode === 'attention') {
      return records.filter(
        (record) =>
          record.balanceAmountCents > 0 ||
          record.accountStatus === 'open' ||
          record.accountStatus === 'partial',
      )
    }

    return records
  })
  const viewTitle = $derived.by(() => {
    if (viewMode === 'accounts') return 'Vista conti'
    if (viewMode === 'cash') return 'Vista incassi'
    if (viewMode === 'attention') return 'Vista attenzioni'
    return 'Vista movimenti'
  })
  const viewDescription = $derived.by(() => {
    if (viewMode === 'accounts') return 'Solo righe con conto collegato, stato e importi consolidati.'
    if (viewMode === 'cash') return 'Movimenti con incassi, residui o saldo economico da controllare.'
    if (viewMode === 'attention') return 'Posizioni aperte, parziali o con saldo ancora da chiudere.'
    return 'Registro completo dei movimenti filtrati.'
  })

  const loadRegistry = async (nextFilters = filters) => {
    loading = true
    try {
      const nextRecords = await getRegistryRecords(nextFilters)
      records = nextRecords
      summary = calculateRegistrySummary(nextRecords)
      selectedRecord = nextRecords.find((record) => record.id === selectedRecord?.id) ?? null
    } finally {
      loading = false
    }
  }

  const handleFiltersChange = (nextFilters: RegistryFilters) => {
    filters = nextFilters
    selectedRecord = null
    loadRegistry(nextFilters)
  }

  const resetFilters = () => {
    const nextFilters = createDefaultRegistryFilters()
    filters = nextFilters
    selectedRecord = null
    loadRegistry(nextFilters)
  }

  const applyOpenRequest = (request: OpenRegistryRequest) => {
    const nextFilters = {
      ...filters,
      customerId: request.customerId ?? null,
      customerQuery: request.customerName ?? '',
      itemId: request.itemId ?? null,
      itemQuery: request.itemCode ?? '',
    }
    filters = nextFilters
    loadRegistry(nextFilters)
  }

  onMount(() => {
    loadRegistry()
  })

  $effect(() => {
    if (openRequest && openRequest.requestedAt !== handledRequestAt) {
      handledRequestAt = openRequest.requestedAt
      applyOpenRequest(openRequest)
    }
  })

  $effect(() => {
    if (selectedRecord && !viewRecords.some((record) => record.id === selectedRecord?.id)) {
      selectedRecord = null
    }
  })
</script>

<section class="settings-panel registry-panel" aria-label="Registro">
  <div class="settings-view-header settings-panel__header registry-panel__header">
    <h2>Registro</h2>
    <span class="settings-toolbar-count">{records.length} movimenti</span>
  </div>

  <div class="registry-panel__filters open">
    <RegistryFiltersPanel {filters} onChange={handleFiltersChange} onReset={resetFilters} />
  </div>

  <RegistrySummaryStrip {summary} />

  <RegistryInsights {records} {summary} year={filters.year} />

  <div class="registry-viewbar" aria-label="Viste registro">
    <div>
      <strong>{viewTitle}</strong>
      <span>{viewDescription}</span>
    </div>
    <div class="registry-viewbar__tabs" role="tablist" aria-label="Modalita registro">
      <button type="button" class:active={viewMode === 'all'} onclick={() => (viewMode = 'all')}>
        Movimenti
      </button>
      <button type="button" class:active={viewMode === 'accounts'} onclick={() => (viewMode = 'accounts')}>
        Conti
      </button>
      <button type="button" class:active={viewMode === 'cash'} onclick={() => (viewMode = 'cash')}>
        Incassi
      </button>
      <button type="button" class:active={viewMode === 'attention'} onclick={() => (viewMode = 'attention')}>
        Attenzioni
      </button>
    </div>
  </div>

  <div class="registry-workspace" class:has-detail={Boolean(selectedRecord)}>
    <div class="registry-workspace__records">
      {#if loading}
        <InlineLoadingState
          eyebrow="Registro"
          title="Caricamento movimenti"
          message="Lettura conti, prenotazioni e incassi filtrati."
          rows={4}
        />
      {:else}
        <RegistryTable
          records={viewRecords}
          {selectedRecord}
          title={viewTitle}
          onSelect={(record) => (selectedRecord = record)}
          onReset={resetFilters}
        />
      {/if}
    </div>

    <RegistryRecordDetail record={selectedRecord} onClose={() => (selectedRecord = null)} />
  </div>
</section>
