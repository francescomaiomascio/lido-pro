<script lang="ts">
  import { beachStatusOptions, getBeachItemStatusLabel } from '../../lib/format/beachLabels'
  import type { BeachItemStatus } from '../../lib/types/beach'

  let {
    currentStatus,
    saving,
    onStatusChange,
  }: {
    currentStatus: BeachItemStatus
    saving: boolean
    onStatusChange: (status: BeachItemStatus) => void
  } = $props()
</script>

<div class="status-actions" aria-label="Cambia stato">
  {#each beachStatusOptions as status}
    <button
      type="button"
      class={`status-action status-action--${status}`}
      disabled={saving || currentStatus === status}
      onclick={() => onStatusChange(status)}
    >
      {getBeachItemStatusLabel(status)}
    </button>
  {/each}
</div>
