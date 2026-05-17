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
  <div class="brand" aria-label={`${APP_DISPLAY_NAME} - Gestione spiaggia`}>
    <img class="brand__wordmark" src="/brand/lidopro-wordmark-transparent.png" alt={APP_DISPLAY_NAME} />
  </div>

  <div class="topbar-actions">
    <ExpandableSearch
      value={searchQuery}
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
