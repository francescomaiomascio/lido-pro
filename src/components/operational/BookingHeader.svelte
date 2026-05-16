<script lang="ts">
  let {
    title,
    meta,
    registryLabel = 'Registro',
    infoLabel = 'Info tecnico',
    collapseLabel = 'Riduci pannello',
    sizeLabel = 'Espandi pannello',
    onRegistry,
    onInfo,
    onSizeToggle,
    onCollapse,
  }: {
    title: string
    meta: string[]
    registryLabel?: string
    infoLabel?: string
    collapseLabel?: string
    sizeLabel?: string
    onRegistry: () => void
    onInfo: () => void
    onSizeToggle: () => void
    onCollapse: () => void
  } = $props()
</script>

<header class="booking-sheet__header">
  <div class="booking-sheet__identity">
    <strong>{title}</strong>
    {#each meta.filter(Boolean) as item}
      <span>{item}</span>
    {/each}
  </div>
  <div class="booking-sheet__header-actions">
    <button type="button" class="booking-icon-button" aria-label={registryLabel} onclick={onRegistry}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M5 4h14v16H5z"></path>
        <path d="M8 8h8M8 12h8M8 16h5"></path>
      </svg>
    </button>
    <button type="button" class="booking-icon-button" aria-label={infoLabel} onclick={onInfo}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 10v6"></path>
        <path d="M12 7h.01"></path>
      </svg>
    </button>
    <button type="button" class="booking-icon-button" aria-label={sizeLabel} onclick={onSizeToggle}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M8 7h8"></path>
        <path d="M8 17h8"></path>
        <path d="M12 7v10"></path>
      </svg>
    </button>
    <button type="button" class="booking-icon-button booking-icon-button--collapse" aria-label={collapseLabel} onclick={onCollapse}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M6 12h12"></path>
      </svg>
    </button>
  </div>
</header>
