<script lang="ts">
  import { APP_DISPLAY_NAME } from '../../lib/config/appConfig'
  import ExpandableSearch from './ExpandableSearch.svelte'

  let {
    searchQuery,
    onSearchChange,
    onMenuOpen,
  }: {
    searchQuery: string
    onSearchChange: (value: string) => void
    onMenuOpen: () => void
  } = $props()

  let searchExpanded = $state(false)
</script>

<header class="app-topbar" class:search-expanded={searchExpanded}>
  <div class="brand">
    <strong>{APP_DISPLAY_NAME}</strong>
    <span>Gestione spiaggia</span>
  </div>

  <div class="topbar-actions">
    <ExpandableSearch
      value={searchQuery}
      placeholder="Cerca posto, cliente, stato"
      onChange={onSearchChange}
      onExpandedChange={(expanded) => (searchExpanded = expanded)}
    />
    <button class="topbar-action topbar-action--menu" type="button" aria-label="Apri menu" onclick={onMenuOpen}>
      <svg class="topbar-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
        <path d="M4 7h16"></path>
        <path d="M4 12h16"></path>
        <path d="M4 17h16"></path>
      </svg>
    </button>
  </div>
</header>
