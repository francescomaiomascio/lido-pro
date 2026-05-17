<script lang="ts">
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectEntryMode } from './state/mapStudioProjectModel'

  let {
    setup,
    onStart,
  }: {
    setup: ParametricSetupState
    onStart: (mode: MapStudioProjectEntryMode) => void
  } = $props()

  const elementCount = $derived(setup.rows.reduce((total, row) => total + row.itemCount, 0))
  const rowCount = $derived(setup.rows.length)
  const areaCount = $derived(setup.zones.filter((zone) => zone.visible !== false).length)
</script>

<section class="map-studio-project-entry" aria-label="Avvio Studio mappa">
  <div class="map-studio-project-entry__nav" aria-label="Navigazione progetto">
    <div>
      <span>Studio mappa</span>
      <strong>Progetti</strong>
    </div>
    <div class="map-studio-project-entry__nav-tabs">
      <button type="button" class="active">Progetti</button>
      <button type="button" onclick={() => onStart('existing')}>Apri bozza</button>
      <button type="button" onclick={() => onStart('template')}>Layout base</button>
    </div>
  </div>

  <div class="map-studio-project-entry__main">
    <div class="map-studio-project-entry__intro">
      <span>Studio mappa</span>
      <strong>Nuovo progetto parametrico</strong>
      <p>Costruisci una bozza progettuale: perimetro, aree, tracciati, ingombri, vincoli e anteprima. Il layout operativo resta protetto.</p>
    </div>

    <div class="map-studio-project-entry__blueprint" aria-hidden="true">
      <svg viewBox="0 0 420 260" role="img">
        <defs>
          <linearGradient id="entry-sea" x1="0" x2="1">
            <stop offset="0" stop-color="#3eb6c0" />
            <stop offset="1" stop-color="#8fd7d0" />
          </linearGradient>
          <linearGradient id="entry-sand" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#f4e5b5" />
            <stop offset="1" stop-color="#d8bb72" />
          </linearGradient>
        </defs>
        <rect x="34" y="26" width="352" height="208" rx="18" fill="url(#entry-sand)" />
        <rect x="34" y="26" width="352" height="48" rx="18" fill="url(#entry-sea)" />
        <path d="M50 72c46 14 78-10 122 4s86 15 132 0 52-2 66 4" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="3" />
        <rect x="55" y="92" width="310" height="42" rx="10" fill="rgba(20,133,95,.18)" stroke="rgba(13,81,75,.38)" />
        <rect x="55" y="146" width="310" height="46" rx="10" fill="rgba(189,88,74,.16)" stroke="rgba(134,59,53,.32)" />
        <rect x="55" y="203" width="310" height="18" rx="9" fill="rgba(106,155,61,.18)" stroke="rgba(62,110,51,.34)" />
        <path d="M78 113h254M78 169h254M78 212h254" stroke="rgba(34,48,51,.38)" stroke-width="2" stroke-dasharray="8 8" />
        <circle cx="102" cy="113" r="8" fill="#14855f" />
        <circle cx="166" cy="113" r="8" fill="#14855f" />
        <circle cx="230" cy="113" r="8" fill="#14855f" />
        <circle cx="294" cy="113" r="8" fill="#14855f" />
        <circle cx="114" cy="169" r="9" fill="#bd584a" />
        <circle cx="178" cy="169" r="9" fill="#bd584a" />
        <circle cx="242" cy="169" r="9" fill="#bd584a" />
        <circle cx="306" cy="169" r="9" fill="#bd584a" />
      </svg>
      <div>
        <span>Layout base disponibile</span>
        <strong>{setup.beach.widthM}m x {setup.beach.depthM}m</strong>
        <small>{elementCount} elementi · {rowCount} tracciati · {areaCount} aree</small>
      </div>
    </div>
  </div>

  <div class="map-studio-project-entry__workspace">
    <aside class="map-studio-project-entry__guide" aria-label="Percorso progettuale">
      <div class="map-studio-project-entry__guide-head">
        <span>Flusso CAD leggero</span>
        <strong>Da modello a bozza verificabile</strong>
      </div>
      <ol>
        <li class="active"><span>01</span><strong>Perimetro</strong><small>dimensioni, lato mare, margini</small></li>
        <li><span>02</span><strong>Aree</strong><small>palme, ombrelloni, palmette, vuoti</small></li>
        <li><span>03</span><strong>Tracciati</strong><small>file, spacing, distribuzione</small></li>
        <li><span>04</span><strong>Ingombri</strong><small>footprint, clearance, simboli</small></li>
        <li><span>05</span><strong>Vincoli</strong><small>distanze, warning, anteprima</small></li>
      </ol>
      <div class="map-studio-project-entry__protection">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
        <div>
          <strong>Layout attivo protetto</strong>
          <span>Ogni scelta apre una bozza progetto. La produzione non viene modificata.</span>
        </div>
      </div>
    </aside>

    <div class="map-studio-project-entry__actions" aria-label="Modalita progetto">
      <button type="button" class="primary map-studio-project-entry__action map-studio-project-entry__action--empty" onclick={() => onStart('empty')}>
        <span class="map-studio-project-entry__action-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M8 4v16M4 8h16M4 16h16" />
          </svg>
        </span>
        <span class="map-studio-project-entry__action-kicker">Crea da zero</span>
        <strong>Parti da vuoto</strong>
        <small>Nessuna area, nessun tracciato e zero elementi generati. Inizi dal perimetro e costruisci il modello passo passo.</small>
        <em>Perimetro · stage tecnico · 0 elementi</em>
      </button>

      <button type="button" class="map-studio-project-entry__action map-studio-project-entry__action--template" onclick={() => onStart('template')}>
        <span class="map-studio-project-entry__action-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
            <circle cx="8" cy="6" r="1.6" />
            <circle cx="13" cy="12" r="1.6" />
            <circle cx="18" cy="18" r="1.6" />
          </svg>
        </span>
        <span class="map-studio-project-entry__action-kicker">Accelera</span>
        <strong>Usa layout base</strong>
        <small>Genera una bozza dal layout canonico: aree, tracciati e posizionamenti pronti da verificare e modificare.</small>
        <em>{setup.beach.widthM}m x {setup.beach.depthM}m · {elementCount} elementi · protetto</em>
      </button>

      <button type="button" class="map-studio-project-entry__action map-studio-project-entry__action--existing" onclick={() => onStart('existing')}>
        <span class="map-studio-project-entry__action-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 4h10l4 4v12H5z" />
            <path d="M15 4v5h5" />
            <path d="M8 13h8M8 17h5" />
          </svg>
        </span>
        <span class="map-studio-project-entry__action-kicker">Riprendi</span>
        <strong>Carica configurazione</strong>
        <small>Apri una configurazione progetto salvata e continua il lavoro senza toccare il layout operativo attivo.</small>
        <em>{setup.layoutVersionId}</em>
      </button>
    </div>
  </div>
</section>
