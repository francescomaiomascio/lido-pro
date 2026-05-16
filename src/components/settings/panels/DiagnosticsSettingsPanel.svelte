<script lang="ts">
  import DiagnosticsPanel from '../../layout/DiagnosticsPanel.svelte'
  import type { BeachLayout } from '../../../lib/types/beach'
  import type { DatabaseRuntime } from '../../../lib/types/db'

  let {
    layout,
    itemCount,
    runtime,
  }: {
    layout: BeachLayout | null
    itemCount: number
    runtime: DatabaseRuntime | null
  } = $props()
</script>

<section class="settings-panel" aria-label="Diagnostica">
  <div class="settings-view-header settings-panel__header">
    <div>
      <h2>Diagnostica</h2>
      <p>Area tecnica isolata dal flusso operativo. Il reset è disponibile solo in browser/dev.</p>
    </div>
  </div>

  <DiagnosticsPanel {layout} {itemCount} {runtime} />
</section>
