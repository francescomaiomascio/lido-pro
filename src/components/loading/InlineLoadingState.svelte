<script lang="ts">
  let {
    eyebrow = 'Operazione in corso',
    title,
    message,
    rows = 3,
    compact = false,
  }: {
    eyebrow?: string
    title: string
    message: string
    rows?: number
    compact?: boolean
  } = $props()

  const skeletonRows = $derived(
    Array.from({ length: rows }, (_, index) => ({
      index,
      width: Math.max(56, 92 - index * 9),
    })),
  )
</script>

<section class="inline-loading-state" class:compact role="status" aria-live="polite">
  <div class="inline-loading-state__signal" aria-hidden="true">
    <span></span>
    <span></span>
    <span></span>
  </div>
  <div class="inline-loading-state__copy">
    <span>{eyebrow}</span>
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
  <div class="inline-loading-state__skeleton" aria-hidden="true">
    {#each skeletonRows as row}
      <span style={`--row-delay: ${row.index * 90}ms; width: ${row.width}%`}></span>
    {/each}
  </div>
</section>
