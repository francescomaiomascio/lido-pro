<script lang="ts">
  import type { BeachLibraryItem } from '../../../lib/map-canvas/library/assetLibraryCatalog'
  import BeachLibraryItemRow from './BeachLibraryItemRow.svelte'

  let {
    items,
    groupByPalmScale = false,
    viewMode,
    showViewbar = true,
    onViewModeChange,
  }: {
    items: BeachLibraryItem[]
    groupByPalmScale?: boolean
    viewMode?: 'grid' | 'list'
    showViewbar?: boolean
    onViewModeChange?: (mode: 'grid' | 'list') => void
  } = $props()

  let localViewMode = $state<'grid' | 'list'>('grid')
  const activeViewMode = $derived(viewMode ?? localViewMode)

  const setViewMode = (mode: 'grid' | 'list') => {
    if (onViewModeChange) {
      onViewModeChange(mode)
      return
    }
    localViewMode = mode
  }

  const palmGroups = $derived([
    {
      id: 'large',
      label: 'Palme grandi',
      items: items.filter((item) => item.palmScaleGroup === 'large'),
    },
    {
      id: 'medium',
      label: 'Palme medie',
      items: items.filter((item) => item.palmScaleGroup === 'medium' || (!item.palmScaleGroup && item.categoryId === 'palms')),
    },
    {
      id: 'small',
      label: 'Palme piccole / palmette',
      items: items.filter((item) => item.palmScaleGroup === 'small'),
    },
  ])
  const activePalmGroups = $derived(palmGroups.filter((group) => group.items.length > 0))
</script>

{#if showViewbar}
  <div class="beach-library-viewbar" aria-label="Vista libreria">
    <span>{items.length} asset</span>
    <div class="beach-library-viewbar__switch" role="group" aria-label="Modalità visualizzazione">
      <button type="button" class:active={activeViewMode === 'grid'} onclick={() => setViewMode('grid')}>Griglia</button>
      <button type="button" class:active={activeViewMode === 'list'} onclick={() => setViewMode('list')}>Lista</button>
    </div>
  </div>
{/if}

<div class={`beach-library-item-list beach-library-item-list--${activeViewMode}`}>
  {#if groupByPalmScale}
    {#each activePalmGroups as group}
      {#each group.items as item}
        <BeachLibraryItemRow {item} compact={activeViewMode === 'list'} eyebrow={group.label} />
      {/each}
    {/each}
  {:else}
    {#each items as item}
      <BeachLibraryItemRow {item} compact={activeViewMode === 'list'} />
    {/each}
  {/if}
</div>
