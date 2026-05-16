<script lang="ts">
  import type { TariffIncludedItem } from '../../lib/types/extraItem'

  let { items }: { items: TariffIncludedItem[] } = $props()
</script>

<div class="included-equipment">
  <strong>Inclusi</strong>
  {#if items.length}
    <span>{items.map((item) => `${item.quantity} ${item.name.toLowerCase()}`).join(', ')}</span>
  {:else}
    <span>Nessuna dotazione inclusa</span>
  {/if}
</div>
