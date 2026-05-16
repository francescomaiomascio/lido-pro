<script lang="ts">
  import type { OpenRegistryRequest } from '../../../lib/state/registryFilters'
  import RegistryPanel from '../../registry/RegistryPanel.svelte'

  let {
    openRequest = null,
  }: {
    openRequest?: OpenRegistryRequest | null
  } = $props()
</script>

<RegistryPanel {openRequest} />
