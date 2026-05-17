<script lang="ts">
  import type { LidoProModuleId } from '../../lib/navigation/lidoproNavigation'
  import type {
    BeachLayout,
    BeachStatusSummary as BeachStatusSummaryType,
  } from '../../lib/types/beach'
  import type { DatabaseRuntime } from '../../lib/types/db'

  let {
    layout,
    summary,
    typeSummary,
    workspaceSummary,
    runtime,
    onOpenModule,
  }: {
    layout: BeachLayout | null
    summary: BeachStatusSummaryType
    typeSummary: { palms: number; umbrellas: number; smallPalms: number }
    workspaceSummary: {
      total: number
      assignedCustomers: number
      openAccounts: number
      activeReservations: number
    }
    runtime: DatabaseRuntime | null
    onOpenModule: (module: LidoProModuleId) => void
  } = $props()

  const runtimeLabel = $derived(
    runtime === 'native-sqlite'
      ? 'SQLite nativo'
      : runtime === 'web-persistent-sqlite'
        ? 'Persistenza web'
        : runtime === 'browser-memory-fallback'
          ? 'Fallback browser'
          : 'In attesa',
  )
  const dimensionsLabel = $derived(
    layout ? `${layout.widthM}m x ${layout.depthM}m` : 'Layout non disponibile',
  )
  const occupiedOrReserved = $derived(summary.occupied + summary.reserved)
  const occupancyRate = $derived(
    summary.total > 0 ? Math.round((occupiedOrReserved / summary.total) * 100) : 0,
  )

  const commandActions: Array<{ label: string; module: LidoProModuleId; primary?: boolean }> = [
    { label: 'Apri layout attivo', module: 'activeLayout', primary: true },
    { label: 'Apri Studio', module: 'studioProjects' },
    { label: 'Nuovo cliente', module: 'clients' },
    { label: 'Registro', module: 'registry' },
    { label: 'Listino', module: 'priceList' },
  ]

  const moduleRows: Array<{
    module: LidoProModuleId
    title: string
    scope: string
    metric: string
    state: string
    action: string
  }> = $derived([
    {
      module: 'activeLayout',
      title: 'Layout operativo',
      scope: 'Mappa, posti, clienti, periodi e conti.',
      metric: `${summary.total} posti · ${summary.free} liberi`,
      state: 'Layout attivo protetto',
      action: 'Apri',
    },
    {
      module: 'studioProjects',
      title: 'Studio / Progetti',
      scope: 'Bozze, sketch parametrico, verifica e pubblicazione.',
      metric: 'Draft separati',
      state: 'Non muta il layout attivo',
      action: 'Gestisci',
    },
    {
      module: 'clients',
      title: 'Clienti',
      scope: 'Anagrafiche, assegnazioni e storico locale.',
      metric: `${workspaceSummary.assignedCustomers} assegnazioni`,
      state: 'Archivio locale',
      action: 'Apri',
    },
    {
      module: 'registry',
      title: 'Registro',
      scope: 'Movimenti, conti, incassi e attivita.',
      metric: `${workspaceSummary.activeReservations} prenotazioni`,
      state: `${workspaceSummary.openAccounts} conti aperti`,
      action: 'Consulta',
    },
    {
      module: 'priceList',
      title: 'Listino',
      scope: 'Articoli, dotazioni, prezzi e regole di conto.',
      metric: 'Catalogo operativo',
      state: 'Locale',
      action: 'Modifica',
    },
  ])

  const readinessRows = $derived([
    { label: 'Liberi', value: summary.free },
    { label: 'Occupati', value: summary.occupied },
    { label: 'Riservati', value: summary.reserved },
    { label: 'Manutenzione', value: summary.maintenance },
  ])

  const activityRows = $derived([
    {
      label: 'Conti aperti',
      value: workspaceSummary.openAccounts,
      note: 'Da seguire nel Registro.',
    },
    {
      label: 'Prenotazioni attive',
      value: workspaceSummary.activeReservations,
      note: 'Operative sul layout attivo.',
    },
    {
      label: 'Bozze Studio',
      value: 'separate',
      note: 'Pubblicazione controllata.',
    },
    {
      label: 'Persistenza',
      value: runtimeLabel,
      note: 'Runtime locale corrente.',
    },
    {
      label: 'Accesso provider',
      value: 'non configurato',
      note: 'Google/Apple sono previsti, non attivi.',
    },
    {
      label: 'Cloud / sync',
      value: 'non attivo',
      note: 'Confine futuro, nessuna sync live.',
    },
  ])
</script>

<section class="lidopro-dashboard" aria-label="Dashboard LidoPro">
  <header class="lidopro-console-header">
    <div class="lidopro-console-header__title">
      <p>Dashboard</p>
      <h1>Console lido</h1>
      <span>Workspace locale, layout attivo, Studio e moduli operativi.</span>
    </div>

    <dl class="lidopro-console-status" aria-label="Stato sintetico">
      <div>
        <dt>Workspace</dt>
        <dd>Spiaggia BDF</dd>
      </div>
      <div>
        <dt>Account</dt>
        <dd>locale</dd>
      </div>
      <div>
        <dt>Layout attivo</dt>
        <dd>{dimensionsLabel}</dd>
      </div>
      <div>
        <dt>Runtime</dt>
        <dd>{runtimeLabel}</dd>
      </div>
    </dl>
  </header>

  <div class="lidopro-command-row" aria-label="Comandi principali">
    {#each commandActions as action}
      <button
        type="button"
        class:primary={action.primary}
        onclick={() => onOpenModule(action.module)}
      >
        {action.label}
      </button>
    {/each}
  </div>

  <div class="lidopro-console-grid">
    <section class="lidopro-console-panel lidopro-console-panel--wide">
      <header class="lidopro-console-panel__header">
        <div>
          <p>Workspace</p>
          <h2>Superfici operative</h2>
        </div>
        <span>{occupiedOrReserved}/{summary.total} impegnati</span>
      </header>

      <div class="lidopro-module-table" role="list" aria-label="Moduli LidoPro">
        {#each moduleRows as row}
          <button
            type="button"
            class="lidopro-module-row"
            onclick={() => onOpenModule(row.module)}
          >
            <span class="lidopro-module-row__name">
              <strong>{row.title}</strong>
              <small>{row.scope}</small>
            </span>
            <span>{row.metric}</span>
            <span>{row.state}</span>
            <b>{row.action}</b>
          </button>
        {/each}
      </div>
    </section>

    <aside class="lidopro-console-panel">
      <header class="lidopro-console-panel__header">
        <div>
          <p>Prontezza</p>
          <h2>Stato operativo</h2>
        </div>
        <span>{occupancyRate}%</span>
      </header>

      <dl class="lidopro-readiness-grid">
        {#each readinessRows as row}
          <div>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        {/each}
      </dl>

      <div class="lidopro-boundary-note">
        <strong>Confine attivo</strong>
        <p>Lo Studio lavora su bozze e anteprime. Il Canvas operativo usa il layout attivo protetto.</p>
      </div>
    </aside>

    <section class="lidopro-console-panel lidopro-console-panel--activity">
      <header class="lidopro-console-panel__header">
        <div>
          <p>Stato</p>
          <h2>Attivita e controllo</h2>
        </div>
      </header>

      <div class="lidopro-activity-list" role="list">
        {#each activityRows as row}
          <div class="lidopro-activity-row" role="listitem">
            <strong>{row.label}</strong>
            <span>{row.value}</span>
            <small>{row.note}</small>
          </div>
        {/each}
      </div>
    </section>

    <aside class="lidopro-console-panel lidopro-console-panel--assets">
      <header class="lidopro-console-panel__header">
        <div>
          <p>Asset spiaggia</p>
          <h2>Composizione</h2>
        </div>
      </header>

      <dl class="lidopro-composition-list">
        <div><dt>Palme</dt><dd>{typeSummary.palms}</dd></div>
        <div><dt>Ombrelloni</dt><dd>{typeSummary.umbrellas}</dd></div>
        <div><dt>Palmette</dt><dd>{typeSummary.smallPalms}</dd></div>
      </dl>
    </aside>
  </div>
</section>
