<script lang="ts">
  import type { LoadingTone } from './loadingTypes'

  let {
    eyebrow = 'Setup',
    title,
    message,
    actionLabel = null,
    tone = 'neutral',
    onAction,
  }: {
    eyebrow?: string
    title: string
    message: string
    actionLabel?: string | null
    tone?: LoadingTone
    onAction?: () => void
  } = $props()
</script>

<section class="setup-state-panel" data-tone={tone} role="status" aria-live="polite">
  <div class="setup-state-panel__indicator" aria-hidden="true">
    <span></span>
  </div>
  <div class="setup-state-panel__copy">
    <span>{eyebrow}</span>
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
  {#if actionLabel && onAction}
    <button type="button" onclick={onAction}>{actionLabel}</button>
  {/if}
</section>
