<script lang="ts">
  let {
    eyebrow = null,
    title,
    message,
    actionLabel = null,
    onAction,
    compact = false,
  }: {
    eyebrow?: string | null
    title: string
    message: string
    actionLabel?: string | null
    onAction?: () => void
    compact?: boolean
  } = $props()
</script>

<div class="customer-empty-state" class:compact>
  {#if eyebrow}
    <span>{eyebrow}</span>
  {/if}
  <h3>{title}</h3>
  <p>{message}</p>
  {#if actionLabel && onAction}
    <button type="button" class="button-secondary" onclick={onAction}>{actionLabel}</button>
  {/if}
</div>
