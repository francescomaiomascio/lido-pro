<script lang="ts">
  import TariffPanel from '../../tariffs/TariffPanel.svelte'
  import type { ExtraItemCatalogEntry } from '../../../lib/types/extraItem'

  let {
    onCatalogChange,
  }: {
    onCatalogChange?: (catalog: ExtraItemCatalogEntry[]) => void
  } = $props()
</script>

<TariffPanel {onCatalogChange} />
