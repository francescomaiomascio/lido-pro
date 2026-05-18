<script lang="ts">
  import type { HomeAction } from './homeOperationalModel'

  let {
    actions,
    onAction,
  }: {
    actions: HomeAction[]
    onAction: (action: HomeAction) => void
  } = $props()
</script>

<nav class="home-command-bar" aria-label="Comandi operativi">
  {#each actions as action}
    <button
      type="button"
      class:primary={action.primary}
      class:disabled={Boolean(action.disabledReason)}
      disabled={Boolean(action.disabledReason)}
      title={action.disabledReason ?? action.label}
      onclick={() => !action.disabledReason && onAction(action)}
    >
      {action.label}
    </button>
  {/each}
</nav>
