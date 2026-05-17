<script lang="ts">
  import type { MapStudioDashboardProject } from '../state/mapStudioDashboardModel'

  let {
    project,
    onOpenDraft,
    onClose,
  }: {
    project: MapStudioDashboardProject
    onOpenDraft: (project: MapStudioDashboardProject) => void
    onClose: () => void
  } = $props()

  const warningRows = $derived([
    { label: 'Distanza minima ombrelloni in Area 2 < 2.00 m', count: 3 },
    { label: 'Passerella non connessa in Area 3', count: 2 },
    { label: 'Vincolo su fila 4 non rispettato', count: 2 },
  ].slice(0, Math.min(3, Math.max(1, project.warningCount))))
</script>

<aside class="map-studio-project-detail" aria-label="Dettaglio progetto selezionato">
  <header>
    <div>
      <strong>{project.name}</strong>
      <mark class={`status-${project.status}`}>{project.statusLabel}</mark>
    </div>
    <button type="button" onclick={onClose} aria-label="Chiudi dettaglio">×</button>
  </header>

  <div class="map-studio-project-detail__preview" aria-label="Mini preview progetto">
    <svg viewBox="0 0 260 150" role="img">
      <defs>
        <linearGradient id={`detail-sea-${project.id}`} x1="0" x2="1">
          <stop offset="0" stop-color="#33aeb8" />
          <stop offset="1" stop-color="#89d3ca" />
        </linearGradient>
        <linearGradient id={`detail-sand-${project.id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#f2dfaa" />
          <stop offset="1" stop-color="#d4b86e" />
        </linearGradient>
      </defs>
      <rect x="20" y="18" width="190" height="112" rx="12" fill={`url(#detail-sand-${project.id})`} />
      <rect x="20" y="18" width="190" height="34" rx="12" fill={`url(#detail-sea-${project.id})`} />
      <path d="M30 52c26 8 46-5 72 2s54 8 82 0" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="2" />
      <rect x="34" y="64" width="162" height="30" rx="8" fill="rgba(20,133,95,.2)" />
      <rect x="34" y="100" width="162" height="22" rx="8" fill="rgba(189,88,74,.18)" />
      <path d="M46 79h136M46 111h136" stroke="rgba(34,48,51,.35)" stroke-width="1.6" stroke-dasharray="7 7" />
      {#each [64, 92, 120, 148] as cx}
        <circle cx={cx} cy="79" r="5" fill="#14855f" />
        <circle cx={cx} cy="111" r="5" fill="#bd584a" />
      {/each}
      <line x1="215" x2="215" y1="18" y2="130" stroke="#5b8e90" stroke-width="1" />
      <line x1="20" x2="210" y1="138" y2="138" stroke="#5b8e90" stroke-width="1" />
      <text x="222" y="76">28m</text>
      <text x="108" y="146">31m</text>
    </svg>
    <dl>
      <div><dt>Dimensioni</dt><dd>{project.dimensionsLabel}</dd></div>
      <div><dt>Aree</dt><dd>{project.areaCount}</dd></div>
      <div><dt>Elementi</dt><dd>{project.elementCount}</dd></div>
      <div><dt>Tracciati</dt><dd>{project.trackCount}</dd></div>
      <div><dt>Warning</dt><dd>{project.warningCount}</dd></div>
    </dl>
  </div>

  <section class="map-studio-project-detail__diff">
    <h3>Diff attivo / bozza</h3>
    <div>
      <span><strong>{project.diff.elements}</strong><em>Elementi</em></span>
      <span><strong>{project.diff.moved}</strong><em>Mossi</em></span>
      <span><strong>{project.diff.added}</strong><em>Aggiunti</em></span>
      <span><strong>{project.diff.removed}</strong><em>Rimossi</em></span>
      <span><strong>{project.diff.warnings}</strong><em>Warning</em></span>
    </div>
  </section>

  <section class="map-studio-project-detail__warnings">
    <h3>Warning</h3>
    {#if project.warningCount === 0}
      <p>Nessun warning registrato.</p>
    {:else}
      {#each warningRows as row}
        <div>
          <span>△</span>
          <p>{row.label}</p>
          <em>{row.count}</em>
        </div>
      {/each}
    {/if}
  </section>

  <div class="map-studio-project-detail__actions">
    <button type="button" class="primary" disabled={!project.canOpenDraft} onclick={() => onOpenDraft(project)}>Apri bozza</button>
    <button type="button" disabled={!project.canDuplicate}>Duplica</button>
    <button type="button" disabled={!project.canExport}>Esporta</button>
    <button type="button" class="danger" disabled={!project.canDelete}>Elimina</button>
    <button type="button" class="primary" disabled={!project.canPublish} title={project.disabledPublishReason ?? 'Attiva bozza'}>Attiva bozza</button>
  </div>
</aside>
