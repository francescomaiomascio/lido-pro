<script lang="ts">
  import type { MapStudioDashboardBackup, MapStudioDashboardVersion } from '../state/mapStudioDashboardModel'

  let {
    versions,
    backups,
  }: {
    versions: MapStudioDashboardVersion[]
    backups: MapStudioDashboardBackup[]
  } = $props()
</script>

<section class="map-studio-dashboard-bands" aria-label="Gestione versioni e backup">
  <article>
    <h3>Versioni recenti</h3>
    {#each versions as version}
      <div>
        <strong>{version.id}</strong>
        <span>{version.dateLabel}</span>
        <em>{version.current ? 'Attuale' : version.sourceLabel}</em>
      </div>
    {/each}
    <button type="button">Vedi tutte le versioni</button>
  </article>

  <article>
    <h3>Import / Export</h3>
    <div><strong>Esporta JSON</strong><span>Scarica configurazione corrente</span><button type="button">Esporta</button></div>
    <div><strong>Importa JSON</strong><span>Carica configurazione progetto</span><button type="button">Importa</button></div>
    <div><strong>Backup configurazione</strong><span>JSON + risorse progetto</span><button type="button">Backup</button></div>
  </article>

  <article>
    <h3>Backup recenti</h3>
    {#each backups as backup}
      <div>
        <strong>{backup.dateLabel}</strong>
        <span>{backup.modeLabel}</span>
        <em>{backup.sizeLabel}</em>
      </div>
    {/each}
    <button type="button">Vedi tutti i backup</button>
  </article>

  <article>
    <h3>Stato backup</h3>
    <div><strong>Ultimo backup</strong><span>{backups[0]?.dateLabel ?? 'Non disponibile'}</span></div>
    <div><strong>Stato</strong><span class="ok">OK</span></div>
    <button type="button">Impostazioni backup</button>
  </article>
</section>
