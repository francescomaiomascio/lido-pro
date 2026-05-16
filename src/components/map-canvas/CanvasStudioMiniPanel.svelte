<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    children,
  }: {
    title: string
    description?: string
    status?: string
    children?: Snippet
  } = $props()
</script>

<section class="canvas-studio-mini-panel">
  <header>
    <div>
      <h3>{title}</h3>
    </div>
  </header>
  <div class="canvas-studio-mini-panel__body">
    {@render children?.()}
  </div>
</section>
