<script lang="ts">
  import {
    beachUsageTypeOptions,
    getBeachItemUsageTypeLabel,
  } from '../../lib/format/beachLabels'
  import type { BeachItemUsageType } from '../../lib/types/beach'

  let {
    currentUsageType,
    saving,
    onUsageTypeChange,
  }: {
    currentUsageType: BeachItemUsageType
    saving: boolean
    onUsageTypeChange: (usageType: BeachItemUsageType) => void
  } = $props()
</script>

<section class="usage-actions" aria-label="Tipo gestione">
  <h3>Tipo gestione</h3>
  <div>
    {#each beachUsageTypeOptions as usageType}
      <button
        type="button"
        class:active={currentUsageType === usageType}
        disabled={saving || currentUsageType === usageType}
        onclick={() => onUsageTypeChange(usageType)}
      >
        {getBeachItemUsageTypeLabel(usageType)}
      </button>
    {/each}
  </div>
</section>
