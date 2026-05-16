<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    columns = 2,
    children,
  }: {
    columns?: 1 | 2 | 3
    children: Snippet
  } = $props()
</script>

<div class={`settings-control-group settings-control-group--${columns}`}>
  {@render children()}
</div>
