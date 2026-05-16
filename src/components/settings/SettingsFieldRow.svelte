<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    label,
    hint = '',
    children,
  }: {
    label: string
    hint?: string
    children: Snippet
  } = $props()
</script>

<label class="settings-field-row">
  <span>
    <strong>{label}</strong>
    {#if hint}
      <small>{hint}</small>
    {/if}
  </span>
  {@render children()}
</label>
