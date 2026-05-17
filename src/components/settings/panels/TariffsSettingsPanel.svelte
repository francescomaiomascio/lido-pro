<script lang="ts">
  import TariffPanel from '../../tariffs/TariffPanel.svelte'
  import type { BeachItem } from '../../../lib/types/beach'
  import type { ExtraItemCatalogEntry } from '../../../lib/types/extraItem'

  let {
    items,
    onCatalogChange,
  }: {
    items: BeachItem[]
    onCatalogChange?: (catalog: ExtraItemCatalogEntry[]) => void
  } = $props()
</script>

<TariffPanel {items} {onCatalogChange} />
