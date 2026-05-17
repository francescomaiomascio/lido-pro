<script lang="ts">
  import type { MapStudioDashboardView } from '../state/mapStudioDashboardModel'

  let {
    activeView,
    onViewChange,
  }: {
    activeView: MapStudioDashboardView
    onViewChange: (view: MapStudioDashboardView) => void
  } = $props()

  const views: Array<{ id: MapStudioDashboardView; label: string; icon: string }> = [
    { id: 'projects', label: 'Progetti', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
    { id: 'drafts', label: 'Bozze', icon: 'M6 3h9l3 3v15H6zM15 3v4h4M9 12h6M9 16h5' },
    { id: 'activeLayout', label: 'Layout attivo', icon: 'M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6zM9 12l2 2 4-5' },
    { id: 'versions', label: 'Versioni', icon: 'M4 12a8 8 0 1 0 3-6M4 4v6h6M12 8v5l3 2' },
    { id: 'importExport', label: 'Import / Export', icon: 'M12 3v12M8 7l4-4 4 4M5 15v4h14v-4' },
    { id: 'publish', label: 'Pubblica', icon: 'M5 12h14M13 6l6 6-6 6M5 5v14' },
  ]
</script>

<nav class="map-studio-dashboard-nav" aria-label="Navigazione dashboard Studio Mappa">
  <div class="map-studio-dashboard-nav__brand">
    <span aria-hidden="true">
      <img src="/brand/lidopro-mark-transparent.png" alt="" />
    </span>
    <strong>Studio Mappa</strong>
  </div>
  <div class="map-studio-dashboard-nav__views">
    {#each views as view}
      <button
        type="button"
        class:active={activeView === view.id}
        onclick={() => onViewChange(view.id)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d={view.icon} />
        </svg>
        <span>{view.label}</span>
      </button>
    {/each}
  </div>
  <div class="map-studio-dashboard-nav__meta">
    <button type="button" aria-label="Notifiche">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    </button>
    <button type="button" aria-label="Aiuto">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.8.7-1.4 1.1-1.4 2.4" />
        <path d="M12 17h.01" />
      </svg>
    </button>
    <span>SM</span>
  </div>
</nav>
