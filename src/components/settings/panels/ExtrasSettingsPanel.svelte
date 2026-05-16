<script lang="ts">
  import ExtraItemCatalogPanel from '../../extras/ExtraItemCatalogPanel.svelte'
  import type { ExtraItemCatalogEntry } from '../../../lib/types/extraItem'

  let {
    catalog,
    onCatalogChange,
  }: {
    catalog: ExtraItemCatalogEntry[]
    onCatalogChange: (catalog: ExtraItemCatalogEntry[]) => void
  } = $props()
</script>

<ExtraItemCatalogPanel {catalog} {onCatalogChange} />
