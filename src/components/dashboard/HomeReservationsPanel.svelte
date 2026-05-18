<script lang="ts">
  import type { LidoProModuleId } from '../../lib/navigation/lidoproNavigation'
  import type { HomeOperationalModel } from './homeOperationalModel'

  let {
    reservations,
    rows,
    onOpenModule,
  }: {
    reservations: HomeOperationalModel['reservationsStatus']
    rows: HomeOperationalModel['reservationRows']
    onOpenModule: (module: LidoProModuleId) => void
  } = $props()
</script>

<section class="home-panel home-panel--reservations" aria-label="Prenotazioni attive e prossime">
  <header>
    <div>
      <span>Prenotazioni</span>
      <h2>Attive / prossime</h2>
    </div>
    <strong>{reservations.active} attive</strong>
  </header>

  <dl class="home-metrics home-metrics--summary">
    <div><dt>Attive</dt><dd>{reservations.active}</dd></div>
    <div><dt>Prossime</dt><dd>{reservations.upcoming}</dd></div>
    <div><dt>Scadono oggi</dt><dd>{reservations.expiringToday}</dd></div>
    <div><dt>Senza conto</dt><dd>{reservations.missingAccount}</dd></div>
  </dl>

  <table class="home-table">
    <thead>
      <tr><th>Posto</th><th>Cliente</th><th>Periodo</th><th>Stato</th><th>Azione</th></tr>
    </thead>
    <tbody>
      {#if rows.length > 0}
        {#each rows as row}
          <tr>
            <td data-label="Posto">{row.place}</td>
            <td data-label="Cliente">{row.customer}</td>
            <td data-label="Periodo">{row.period}</td>
            <td data-label="Stato">{row.state}</td>
            <td data-label="Azione"><button type="button" onclick={() => onOpenModule(row.module)}>{row.action}</button></td>
          </tr>
        {/each}
      {:else}
        <tr class="home-empty-row"><td colspan="5">Nessuna prenotazione attiva.</td></tr>
      {/if}
    </tbody>
  </table>
</section>
