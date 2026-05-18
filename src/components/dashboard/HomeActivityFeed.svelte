<script lang="ts">
  import type { LidoProModuleId } from '../../lib/navigation/lidoproNavigation'
  import type { HomeOperationalModel } from './homeOperationalModel'

  let {
    rows,
    onOpenModule,
  }: {
    rows: HomeOperationalModel['recentActivity']
    onOpenModule: (module: LidoProModuleId) => void
  } = $props()
</script>

<section class="home-panel home-panel--activity" aria-label="Registro recente e activity feed">
  <header>
    <div>
      <span>Registro recente</span>
      <h2>Movimenti</h2>
    </div>
  </header>

  <table class="home-table">
    <thead>
      <tr><th>Ora/Data</th><th>Origine</th><th>Evento</th><th>Importo/Stato</th><th>Azione</th></tr>
    </thead>
    <tbody>
      {#if rows.length > 0}
        {#each rows as row}
          <tr>
            <td data-label="Ora/Data">{row.time}</td>
            <td data-label="Origine">{row.origin}</td>
            <td data-label="Evento">{row.event}</td>
            <td data-label="Importo/Stato">{row.amount} · {row.state}</td>
            <td data-label="Azione"><button type="button" onclick={() => onOpenModule(row.module)}>Apri</button></td>
          </tr>
        {/each}
      {:else}
        <tr class="home-empty-row"><td colspan="5">Nessun movimento recente.</td></tr>
      {/if}
    </tbody>
  </table>
</section>
