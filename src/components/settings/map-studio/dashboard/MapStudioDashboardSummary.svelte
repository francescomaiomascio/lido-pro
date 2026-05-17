<script lang="ts">
  import type { MapStudioDashboardSummaryItem } from '../state/mapStudioDashboardModel'

  let {
    summaries,
    onSummaryAction,
  }: {
    summaries: MapStudioDashboardSummaryItem[]
    onSummaryAction: (summary: MapStudioDashboardSummaryItem) => void
  } = $props()

  const iconPath = (tone: MapStudioDashboardSummaryItem['tone']) => {
    if (tone === 'protected') return 'M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6zM9 12l2 2 4-5'
    if (tone === 'draft') return 'M6 3h9l3 3v15H6zM15 3v4h4'
    if (tone === 'diff') return 'M7 7h10M7 12h10M7 17h10M4 7h.01M4 12h.01M4 17h.01'
    if (tone === 'history') return 'M8 7h8M8 12h8M8 17h5M5 3h14v18H5z'
    return 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 12l2 2 4-5'
  }
</script>

<section class="map-studio-dashboard-summary" aria-label="Stato Studio Mappa">
  {#each summaries as summary}
    <article class={`map-studio-dashboard-summary__card tone-${summary.tone}`}>
      <header>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d={iconPath(summary.tone)} />
        </svg>
        <span>{summary.label}</span>
      </header>
      <strong>{summary.title}</strong>
      <p>{summary.detail}</p>
      {#if summary.meta}
        <em>{summary.meta}</em>
      {/if}
      <button
        type="button"
        disabled={Boolean(summary.disabledReason)}
        title={summary.disabledReason ?? summary.actionLabel}
        onclick={() => onSummaryAction(summary)}
      >
        {summary.actionLabel}
      </button>
    </article>
  {/each}
</section>
