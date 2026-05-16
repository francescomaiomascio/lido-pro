<script lang="ts">
  import type { ActiveBeachView } from '../../lib/state/beachViewState'

  let {
    activeView,
    mapLabel = 'Mappa',
    listLabel = 'Lista',
    onViewChange,
  }: {
    activeView: ActiveBeachView
    mapLabel?: string
    listLabel?: string
    onViewChange: (view: ActiveBeachView) => void
  } = $props()
</script>

<div
  class="view-switcher"
  class:view-switcher--list={activeView === 'list'}
  role="tablist"
  aria-label="Vista principale"
>
  <button
    type="button"
    class:active={activeView === 'map'}
    aria-selected={activeView === 'map'}
    aria-label={mapLabel}
    role="tab"
    onclick={() => onViewChange('map')}
  >
    <span class="view-switcher__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"></path>
        <path d="M9 3v15"></path>
        <path d="M15 6v15"></path>
      </svg>
    </span>
    <span class="view-switcher__label">{mapLabel}</span>
  </button>
  <button
    type="button"
    class:active={activeView === 'list'}
    aria-selected={activeView === 'list'}
    aria-label={listLabel}
    role="tab"
    onclick={() => onViewChange('list')}
  >
    <span class="view-switcher__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 6h13"></path>
        <path d="M8 12h13"></path>
        <path d="M8 18h13"></path>
        <path d="M3 6h.01"></path>
        <path d="M3 12h.01"></path>
        <path d="M3 18h.01"></path>
      </svg>
    </span>
    <span class="view-switcher__label">{listLabel}</span>
  </button>
</div>
