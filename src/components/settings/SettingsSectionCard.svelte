<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    description = '',
    muted = false,
    children,
  }: {
    title: string
    description?: string
    muted?: boolean
    children: Snippet
  } = $props()
</script>

<section class="settings-section-card" class:muted>
  <div class="settings-section-card__header">
    <h3>{title}</h3>
    {#if description}
      <p>{description}</p>
    {/if}
  </div>
  <div class="settings-section-card__body">
    {@render children()}
  </div>
</section>
