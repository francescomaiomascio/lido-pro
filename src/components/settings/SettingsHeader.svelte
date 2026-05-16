<script lang="ts">
  import type { Snippet } from 'svelte'
  import SettingsStatusPill from './SettingsStatusPill.svelte'

  let {
    title,
    description,
    status = 'Draft',
    children,
  }: {
    title: string
    description: string
    status?: string
    children?: Snippet
  } = $props()
</script>

<header class="settings-view-header settings-modern-header">
  <div>
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
  {#if children}
    {@render children()}
  {:else}
    <SettingsStatusPill label={status} />
  {/if}
</header>
