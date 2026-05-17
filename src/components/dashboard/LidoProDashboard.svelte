<script lang="ts">
  import { DEFAULT_WORKSPACE_NAME } from '../../lib/config/appConfig'
  import { accountStatusLabels } from '../../lib/format/accountLabels'
  import { getBeachDisplayCode } from '../../lib/format/beachDisplayCodes'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { reservationStatusLabels, reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { LidoProModuleId } from '../../lib/navigation/lidoproNavigation'
  import type {
    BeachItem,
    BeachLayout,
    BeachStatusSummary as BeachStatusSummaryType,
  } from '../../lib/types/beach'
  import type { DatabaseRuntime } from '../../lib/types/db'

  type DashboardAction = {
    label: string
    module: LidoProModuleId
    primary?: boolean
  }

  type DashboardTableRow = {
    key: string
    place: string
    customer: string
    period: string
    amount?: string
    state: string
    action: string
    module: LidoProModuleId
  }

  type DashboardActivityRow = {
    key: string
    time: string
    origin: string
    event: string
    amount: string
    state: string
    module: LidoProModuleId
  }

  let {
    layout,
    items,
    summary,
    typeSummary,
    workspaceSummary,
    runtime,
    onOpenModule,
  }: {
    layout: BeachLayout | null
    items: BeachItem[]
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
  const openBalanceCents = $derived(
    items.reduce((total, item) => {
      const account = item.activeAccount
      return account?.active ? total + account.balanceAmountCents : total
    }, 0),
  )
  const operationalDateLabel = new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date())

  const commandActions: DashboardAction[] = [
    { label: 'Apri Spiaggia', module: 'activeLayout', primary: true },
    { label: 'Apri Studio', module: 'studioProjects' },
    { label: 'Nuovo cliente', module: 'clients' },
    { label: 'Apri Registro', module: 'registry' },
    { label: 'Apri Listino', module: 'priceList' },
  ]

  const openAccountRows = $derived<DashboardTableRow[]>(
    items
      .flatMap((item) => {
        const account = item.activeAccount
        if (!account?.active) return []

        return [{
          key: account.id,
          place: getBeachDisplayCode(item, items),
          customer: item.assignedCustomer?.customer.fullName ?? 'Nessun cliente',
          period: item.currentReservation
            ? formatDateRangeItalian(item.currentReservation.startDate, item.currentReservation.endDate)
            : account.seasonLabel ?? 'Periodo non impostato',
          amount: formatEuroFromCents(account.balanceAmountCents),
          state: accountStatusLabels[account.status],
          action: 'Apri conto',
          module: 'registry' as const,
        }]
      })
      .slice(0, 5),
  )

  const reservationRows = $derived<DashboardTableRow[]>(
    items
      .flatMap((item) => {
        const reservation = item.currentReservation
        if (!reservation?.active) return []

        return [{
          key: reservation.id,
          place: getBeachDisplayCode(item, items),
          customer: item.assignedCustomer?.customer.fullName ?? 'Nessun cliente',
          period: formatDateRangeItalian(reservation.startDate, reservation.endDate),
          state: `${reservationTypeLabels[reservation.reservationType]} · ${reservationStatusLabels[reservation.status]}`,
          action: 'Apri posto',
          module: 'activeLayout' as const,
        }]
      })
      .slice(0, 5),
  )

  const recentActivityRows = $derived<DashboardActivityRow[]>([
    ...(workspaceSummary.openAccounts > 0
      ? [{
          key: 'open-accounts',
          time: 'oggi',
          origin: 'Conti',
          event: `${workspaceSummary.openAccounts} conti aperti`,
          amount: formatEuroFromCents(openBalanceCents),
          state: 'da seguire',
          module: 'registry' as const,
        }]
      : []),
    ...(workspaceSummary.activeReservations > 0
      ? [{
          key: 'active-reservations',
          time: 'oggi',
          origin: 'Prenotazioni',
          event: `${workspaceSummary.activeReservations} prenotazioni attive`,
          amount: '-',
          state: 'operative',
          module: 'activeLayout' as const,
        }]
      : []),
    ...(workspaceSummary.assignedCustomers > 0
      ? [{
          key: 'assigned-customers',
          time: 'locale',
          origin: 'Clienti',
          event: `${workspaceSummary.assignedCustomers} assegnazioni cliente`,
          amount: '-',
          state: 'archivio',
          module: 'clients' as const,
        }]
      : []),
  ])

  const attentionRows = $derived(
    [
      summary.maintenance > 0
        ? { key: 'maintenance', title: 'Manutenzione', detail: `${summary.maintenance} posti da controllare`, module: 'activeLayout' as const }
        : null,
      workspaceSummary.openAccounts > 0
        ? { key: 'accounts', title: 'Conti aperti', detail: `${workspaceSummary.openAccounts} posizioni con saldo`, module: 'registry' as const }
        : null,
      workspaceSummary.activeReservations > 0
        ? { key: 'reservations', title: 'Prenotazioni attive', detail: `${workspaceSummary.activeReservations} periodi operativi`, module: 'activeLayout' as const }
        : null,
      { key: 'studio', title: 'Studio separato', detail: 'Bozze e pubblicazione non mutano la Spiaggia attiva', module: 'studioProjects' as const },
    ].filter((row) => row !== null),
  )

  const supportRows = $derived([
    {
      key: 'clients',
      label: 'Clienti',
      value: `${workspaceSummary.assignedCustomers} assegnazioni`,
      note: 'Anagrafiche e attività locale',
      module: 'clients' as const,
    },
    {
      key: 'registry',
      label: 'Registro',
      value: `${workspaceSummary.openAccounts} conti aperti`,
      note: `Residuo ${formatEuroFromCents(openBalanceCents)}`,
      module: 'registry' as const,
    },
    {
      key: 'price-list',
      label: 'Listino',
      value: 'Catalogo locale',
      note: 'Tariffe, dotazioni, extra',
      module: 'priceList' as const,
    },
  ])
</script>

<section class="lidopro-dashboard lidopro-dashboard--operations" aria-label="Dashboard operativa LidoPro">
  <header class="dashboard-live-strip" aria-label="Stato operativo sintetico">
    <div class="dashboard-live-strip__identity">
      <p>Home</p>
      <h1>Console operativa</h1>
    </div>
    <dl>
      <div><dt>Lido</dt><dd>{DEFAULT_WORKSPACE_NAME}</dd></div>
      <div><dt>Data</dt><dd>{operationalDateLabel}</dd></div>
      <div><dt>Spiaggia</dt><dd>{dimensionsLabel}</dd></div>
      <div><dt>Bar</dt><dd>non configurato</dd></div>
      <div><dt>Studio</dt><dd>bozze separate</dd></div>
      <div><dt>Runtime</dt><dd>{runtimeLabel}</dd></div>
    </dl>
  </header>

  <nav class="dashboard-command-bar" aria-label="Azioni operative">
    {#each commandActions as action}
      <button
        type="button"
        class:primary={action.primary}
        onclick={() => onOpenModule(action.module)}
      >
        {action.label}
      </button>
    {/each}
  </nav>

  <div class="dashboard-operations-grid">
    <section class="dashboard-operation-lane dashboard-operation-lane--primary">
      <header>
        <div>
          <p>Spiaggia oggi</p>
          <h2>Layout attivo protetto</h2>
        </div>
        <button type="button" onclick={() => onOpenModule('activeLayout')}>Apri Spiaggia</button>
      </header>

      <dl class="dashboard-metric-grid">
        <div><dt>Liberi</dt><dd>{summary.free}</dd></div>
        <div><dt>Occupati</dt><dd>{summary.occupied}</dd></div>
        <div><dt>Riservati</dt><dd>{summary.reserved}</dd></div>
        <div><dt>Manutenzione</dt><dd>{summary.maintenance}</dd></div>
        <div><dt>Prenotazioni</dt><dd>{workspaceSummary.activeReservations}</dd></div>
        <div><dt>Conti aperti</dt><dd>{workspaceSummary.openAccounts}</dd></div>
      </dl>

      <footer>
        <span>{occupancyRate}% impegnati</span>
        <span>{workspaceSummary.total} posti · {typeSummary.palms} palme · {typeSummary.umbrellas} ombrelloni · {typeSummary.smallPalms} palmette</span>
      </footer>
    </section>

    <section class="dashboard-operation-lane dashboard-operation-lane--disabled">
      <header>
        <div>
          <p>Bar oggi</p>
          <h2>Modulo non configurato</h2>
        </div>
        <span>previsto</span>
      </header>
      <p>
        Spazio architetturale per comande, banco, articoli bar e collegamento ai conti Spiaggia.
        Nessun ordine o incasso viene simulato in questa build.
      </p>
    </section>

    <aside class="dashboard-attention-rail" aria-label="Attenzioni operative">
      <header>
        <p>Attenzione</p>
        <h2>Da seguire</h2>
      </header>

      <div class="dashboard-attention-list">
        {#each attentionRows as row}
          <button type="button" onclick={() => onOpenModule(row.module)}>
            <strong>{row.title}</strong>
            <span>{row.detail}</span>
          </button>
        {/each}
      </div>
    </aside>
  </div>

  <div class="dashboard-table-grid">
    <section class="dashboard-table-panel">
      <header>
        <p>Conti</p>
        <h2>Aperti / da preparare</h2>
      </header>

      <table class="dashboard-data-table">
        <thead>
          <tr><th>Posto</th><th>Cliente</th><th>Periodo</th><th>Residuo</th><th>Stato</th><th>Azione</th></tr>
        </thead>
        <tbody>
          {#if openAccountRows.length > 0}
            {#each openAccountRows as row}
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
            <tr class="dashboard-empty-row"><td colspan="6">Nessun conto operativo aperto.</td></tr>
          {/if}
        </tbody>
      </table>
    </section>

    <section class="dashboard-table-panel">
      <header>
        <p>Prenotazioni</p>
        <h2>Attive / prossime</h2>
      </header>

      <table class="dashboard-data-table">
        <thead>
          <tr><th>Posto</th><th>Cliente</th><th>Periodo</th><th>Stato</th><th>Azione</th></tr>
        </thead>
        <tbody>
          {#if reservationRows.length > 0}
            {#each reservationRows as row}
              <tr>
                <td data-label="Posto">{row.place}</td>
                <td data-label="Cliente">{row.customer}</td>
                <td data-label="Periodo">{row.period}</td>
                <td data-label="Stato">{row.state}</td>
                <td data-label="Azione"><button type="button" onclick={() => onOpenModule(row.module)}>{row.action}</button></td>
              </tr>
            {/each}
          {:else}
            <tr class="dashboard-empty-row"><td colspan="5">Nessuna prenotazione attiva nel layout.</td></tr>
          {/if}
        </tbody>
      </table>
    </section>

    <section class="dashboard-table-panel dashboard-table-panel--wide">
      <header>
        <p>Registro</p>
        <h2>Attività recente</h2>
      </header>

      <table class="dashboard-data-table">
        <thead>
          <tr><th>Ora/data</th><th>Origine</th><th>Evento</th><th>Importo</th><th>Stato</th><th>Azione</th></tr>
        </thead>
        <tbody>
          {#if recentActivityRows.length > 0}
            {#each recentActivityRows as row}
              <tr>
                <td data-label="Ora/data">{row.time}</td>
                <td data-label="Origine">{row.origin}</td>
                <td data-label="Evento">{row.event}</td>
                <td data-label="Importo">{row.amount}</td>
                <td data-label="Stato">{row.state}</td>
                <td data-label="Azione"><button type="button" onclick={() => onOpenModule(row.module)}>Apri</button></td>
              </tr>
            {/each}
          {:else}
            <tr class="dashboard-empty-row"><td colspan="6">Nessun evento operativo da evidenziare.</td></tr>
          {/if}
        </tbody>
      </table>
    </section>
  </div>

  <section class="dashboard-service-strip" aria-label="Servizi condivisi">
    {#each supportRows as row}
      <button type="button" onclick={() => onOpenModule(row.module)}>
        <strong>{row.label}</strong>
        <span>{row.value}</span>
        <small>{row.note}</small>
      </button>
    {/each}
  </section>
</section>
