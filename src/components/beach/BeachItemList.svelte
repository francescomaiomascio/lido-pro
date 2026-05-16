<script lang="ts">
  import BeachListRow from './BeachListRow.svelte'
  import type { BeachItem, BeachItemType } from '../../lib/types/beach'

  type Filter = 'all' | BeachItemType

  let {
    items,
    selectedItemId,
    onOpenItem,
  }: {
    items: BeachItem[]
    selectedItemId: string | null
    onOpenItem: (itemId: string) => void
  } = $props()

  let filter: Filter = $state('all')

  const matchesFilter = (item: BeachItem) => filter === 'all' || item.type === filter
  const visibleItems = $derived(items.filter(matchesFilter))
  const occupiedCount = $derived(visibleItems.filter((item) => item.status === 'occupied').length)
  const freeCount = $derived(visibleItems.filter((item) => item.status === 'free').length)
</script>

<section class="list-panel" aria-label="Lista posti spiaggia">
  <div class="list-heading">
    <div>
      <h1>Lista posti</h1>
      <p>{visibleItems.length} risultati</p>
    </div>
    <div class="list-heading__metrics" aria-label="Riepilogo lista">
      <span><strong>{freeCount}</strong> liberi</span>
      <span><strong>{occupiedCount}</strong> occupati</span>
    </div>
  </div>

  <div class="list-filters" aria-label="Filtri lista">
    <button type="button" class:active={filter === 'all'} onclick={() => (filter = 'all')}>Tutti</button>
    <button type="button" class:active={filter === 'palm'} onclick={() => (filter = 'palm')}>Palme</button>
    <button type="button" class:active={filter === 'umbrella'} onclick={() => (filter = 'umbrella')}>
      Ombrelloni
    </button>
    <button
      type="button"
      class:active={filter === 'small_palm'}
      onclick={() => (filter = 'small_palm')}
    >
      Palmette
    </button>
  </div>

  <div class="list-results">
    <div class="beach-list-head" aria-hidden="true">
      <span>Posto</span>
      <span>Cliente</span>
      <span>Prenotazione</span>
      <span>Conto</span>
      <span>Stato</span>
      <span></span>
    </div>
    {#each visibleItems as item (item.id)}
      <BeachListRow {item} selected={selectedItemId === item.id} onOpen={onOpenItem} />
    {:else}
      <p class="empty-list">Nessun posto trovato.</p>
    {/each}
  </div>
</section>
