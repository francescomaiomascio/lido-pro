<script lang="ts">
  import { APP_DISPLAY_NAME, DEFAULT_WORKSPACE_NAME } from '../../lib/config/appConfig'
  import {
    getLidoProModule,
    lidoproTopbarItems,
    type LidoProModuleId,
    type LidoProPrimaryModuleId,
  } from '../../lib/navigation/lidoproNavigation'
  import AppAccountMenu from './AppAccountMenu.svelte'
  import ExpandableSearch from './ExpandableSearch.svelte'

  let {
    searchQuery,
    activeModule,
    workspaceName = DEFAULT_WORKSPACE_NAME,
    runtimeLabel = 'locale',
    onSearchChange,
    onModuleSelect,
    onOpenSystem,
  }: {
    searchQuery: string
    activeModule: LidoProModuleId
    workspaceName?: string
    runtimeLabel?: string
    onSearchChange: (value: string) => void
    onModuleSelect: (module: LidoProModuleId) => void
    onOpenSystem: () => void
  } = $props()

  let searchExpanded = $state(false)
  const activeModuleLabel = $derived(getLidoProModule(activeModule).label)

  const selectTopbarItem = (id: LidoProPrimaryModuleId | 'bar') => {
    if (id === 'bar') {
      return
    }
    onModuleSelect(id)
  }

  const openSystem = () => {
    onOpenSystem()
  }
</script>

<header class="app-topbar" class:search-expanded={searchExpanded}>
  <button
    type="button"
    class="brand"
    aria-label="Vai alla dashboard LidoPro"
    onclick={() => onModuleSelect('dashboard')}
  >
    <img class="brand__wordmark" src="/brand/svg/lidopro-wordmark-color.svg" alt={APP_DISPLAY_NAME} />
    <span class="brand__module">{activeModuleLabel}</span>
  </button>

  <nav class="topbar-module-nav" aria-label="Workspace LidoPro">
    {#each lidoproTopbarItems as module}
      <button
        type="button"
        class="topbar-module-nav__item"
        class:active={module.id === activeModule}
        class:disabled={module.disabled}
        aria-current={module.id === activeModule ? 'page' : undefined}
        aria-disabled={module.disabled ? 'true' : undefined}
        aria-label={module.disabled ? `${module.label}: ${module.disabledReason}` : module.label}
        disabled={module.disabled}
        onclick={() => selectTopbarItem(module.id)}
      >
        <span class="topbar-module-nav__icon" aria-hidden="true">
          {#if module.id === 'dashboard'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 5h7v7H4z"></path>
              <path d="M13 5h7v4h-7z"></path>
              <path d="M13 11h7v8h-7z"></path>
              <path d="M4 14h7v5H4z"></path>
            </svg>
          {:else if module.id === 'clients'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M15 19v-1.4a3.6 3.6 0 0 0-3.6-3.6H7.6A3.6 3.6 0 0 0 4 17.6V19"></path>
              <circle cx="9.5" cy="8" r="3"></circle>
              <path d="M17 11.5a2.8 2.8 0 0 0 0-5.5"></path>
              <path d="M20 19v-1a3.2 3.2 0 0 0-2-3"></path>
            </svg>
          {:else if module.id === 'registry'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 4h12a1 1 0 0 1 1 1v15l-3-1.5L12 20l-4-1.5L5 20V5a1 1 0 0 1 1-1Z"></path>
              <path d="M8 8h8"></path>
              <path d="M8 12h8"></path>
              <path d="M8 16h5"></path>
            </svg>
          {:else if module.id === 'priceList'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 5h14v14H5z"></path>
              <path d="M8 9h8"></path>
              <path d="M8 13h8"></path>
              <path d="M8 17h4"></path>
            </svg>
          {:else if module.id === 'activeLayout'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16v12H4z"></path>
              <path d="M8 10h8"></path>
              <path d="M8 14h5"></path>
              <circle cx="17" cy="15" r="1.4"></circle>
            </svg>
          {:else if module.id === 'studioProjects'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 18h16"></path>
              <path d="M6 15 16 5l3 3-10 10H6z"></path>
              <path d="m14 7 3 3"></path>
            </svg>
          {:else if module.id === 'bar'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 4h12"></path>
              <path d="M8 4v5a4 4 0 0 0 8 0V4"></path>
              <path d="M12 13v6"></path>
              <path d="M8 20h8"></path>
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 3v3"></path>
              <path d="M12 18v3"></path>
              <path d="M3 12h3"></path>
              <path d="M18 12h3"></path>
              <path d="m5 5 2 2"></path>
              <path d="m17 17 2 2"></path>
              <path d="m19 5-2 2"></path>
              <path d="m7 17-2 2"></path>
            </svg>
          {/if}
        </span>
        <span class="topbar-module-nav__label">{module.label}</span>
        <span class="topbar-module-nav__short">{module.shortLabel}</span>
      </button>
    {/each}
  </nav>

  <div class="topbar-actions">
    <ExpandableSearch
      value={searchQuery}
      onChange={onSearchChange}
      onExpandedChange={(expanded) => (searchExpanded = expanded)}
    />
    <button
      type="button"
      class="topbar-action topbar-utility-button"
      aria-label="Apri stato e avvisi locali"
      title="Stato e avvisi locali"
      onclick={openSystem}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    </button>
    <button
      type="button"
      class="topbar-action topbar-utility-button"
      aria-label="Apri guida e informazioni app"
      title="Guida e informazioni"
      onclick={openSystem}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M9.7 9a2.4 2.4 0 0 1 4.6 1.1c0 1.8-2.3 2-2.3 3.7"></path>
        <path d="M12 17h.01"></path>
      </svg>
    </button>
    <AppAccountMenu {workspaceName} {runtimeLabel} {onOpenSystem} />
  </div>
</header>
