<script lang="ts">
  import type { LidoProModuleId } from '../../lib/navigation/lidoproNavigation'
  import type { HomeOperationalModel } from './homeOperationalModel'

  let {
    financial,
    rows,
    onOpenModule,
  }: {
    financial: HomeOperationalModel['financialStatus']
    rows: HomeOperationalModel['accountRows']
    onOpenModule: (module: LidoProModuleId) => void
  } = $props()
</script>

<section class="home-panel home-panel--accounts" aria-label="Conti aperti e da preparare">
  <header>
    <div>
      <span>Conti / Pagamenti</span>
      <h2>Conti aperti / da preparare</h2>
    </div>
    <strong>{financial.residualOpen}</strong>
  </header>

  <dl class="home-metrics home-metrics--summary">
    <div><dt>Aperti</dt><dd>{financial.openAccounts}</dd></div>
    <div><dt>Residuo</dt><dd>{financial.residualOpen}</dd></div>
    <div><dt>Da preparare</dt><dd>{financial.accountsToPrepare}</dd></div>
  </dl>

  <table class="home-table">
    <thead>
      <tr><th>Posto</th><th>Cliente</th><th>Periodo</th><th>Residuo</th><th>Stato</th><th>Azione</th></tr>
    </thead>
    <tbody>
      {#if rows.length > 0}
        {#each rows as row}
          <tr>
            <td data-label="Posto">{row.place}</td>
            <td data-label="Cliente">{row.customer}</td>
            <td data-label="Periodo">{row.period}</td>
            <td data-label="Residuo">{row.amount}</td>
            <td data-label="Stato">{row.state}</td>
            <td data-label="Azione"><button type="button" onclick={() => onOpenModule(row.module)}>{row.action}</button></td>
          </tr>
        {/each}
      {:else}
        <tr class="home-empty-row"><td colspan="6">Nessun conto operativo aperto.</td></tr>
      {/if}
    </tbody>
  </table>
</section>
