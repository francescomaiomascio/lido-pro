import { DEFAULT_WORKSPACE_NAME } from '../../lib/config/appConfig'
import { accountStatusLabels } from '../../lib/format/accountLabels'
import { getBeachDisplayCode } from '../../lib/format/beachDisplayCodes'
import { formatDateRangeItalian } from '../../lib/format/dateRange'
import { formatEuroFromCents } from '../../lib/format/money'
import { reservationStatusLabels, reservationTypeLabels } from '../../lib/format/reservationLabels'
import type { LidoProModuleId } from '../../lib/navigation/lidoproNavigation'
import type { BeachItem, BeachLayout, BeachStatusSummary } from '../../lib/types/beach'
import type { DatabaseRuntime } from '../../lib/types/db'
import type { ExtraItemCatalogEntry } from '../../lib/types/extraItem'

export type HomeSeverity = 'info' | 'warning' | 'critical'
export type HomeDomain =
  | 'beach'
  | 'bar'
  | 'account'
  | 'reservation'
  | 'studio'
  | 'system'
  | 'catalog'
  | 'employees'

export type HomeAction = {
  label: string
  module: LidoProModuleId | null
  primary?: boolean
  disabledReason?: string
}

export type HomeTableRow = {
  key: string
  place: string
  customer: string
  period: string
  amount?: string
  state: string
  action: string
  module: LidoProModuleId
}

export type HomeActivityRow = {
  key: string
  time: string
  origin: string
  event: string
  amount: string
  state: string
  module: LidoProModuleId
}

export type HomePriorityQueueItem = {
  id: string
  domain: HomeDomain
  severity: HomeSeverity
  title: string
  description: string
  targetAction: string
  targetModule: LidoProModuleId | null
}

export type HomeOperationalModel = {
  currentDate: string
  lidoName: string
  header: {
    beach: string
    bar: string
    accounts: string
    studio: string
    runtime: string
  }
  beachStatus: {
    totalPlaces: number
    freePlaces: number
    occupiedPlaces: number
    reservedPlaces: number
    maintenancePlaces: number
    activeReservations: number
    openAccounts: number
    pendingAccounts: number
    occupancyRate: number
    composition: string
  }
  barStatus: {
    configured: boolean
    openOrders: number | null
    pendingOrders: number | null
    barRevenueToday: string | null
    barCatalogItems: number
    cashStatus: string
    disabledReason: string
  }
  financialStatus: {
    openAccounts: number
    pendingPayments: number
    totalDue: string
    collectedToday: string
    residualOpen: string
    accountsToPrepare: number
    accountsWithBalance: number
  }
  reservationsStatus: {
    active: number
    upcoming: number
    expiringToday: number
    missingCustomer: number
    missingPeriod: number
    missingAccount: number
  }
  registryStatus: {
    movementsToday: number | null
    lastMovementAt: string
    openIssues: number
    totalCollected: string
    totalDue: string
  }
  studioStatus: {
    activeDraftName: string
    draftState: string
    warnings: number
    previewAvailable: boolean
    publicationBlocked: boolean
    lastEditedAt: string
  }
  catalogStatus: {
    beachItemsActive: number
    barItemsActive: number
    missingPrices: number | null
    inactiveRequiredItems: number | null
    syncWithLayoutStatus: string
  }
  customerStatus: {
    assignedCustomers: number
    placesWithoutCustomer: number
    reservationsWithoutCustomer: number
    assignmentsMissingPeriod: number
  }
  staffStatus: {
    registeredEmployees: number
    activeEmployees: number
    onShiftEmployees: number
    assignedBeach: number
    assignedBar: number
    stateLabel: string
  }
  commandActions: HomeAction[]
  accountRows: HomeTableRow[]
  reservationRows: HomeTableRow[]
  recentActivity: HomeActivityRow[]
  priorityQueue: HomePriorityQueueItem[]
}

export type HomeOperationalModelInput = {
  layout: BeachLayout | null
  items: BeachItem[]
  summary: BeachStatusSummary
  typeSummary: { palms: number; umbrellas: number; smallPalms: number }
  workspaceSummary: {
    total: number
    assignedCustomers: number
    openAccounts: number
    activeReservations: number
  }
  runtime: DatabaseRuntime | null
  extraCatalog: ExtraItemCatalogEntry[]
}

const currentDateLabel = () =>
  new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date())

const runtimeLabel = (runtime: DatabaseRuntime | null) =>
  runtime === 'native-sqlite'
    ? 'SQLite nativo'
    : runtime === 'web-persistent-sqlite'
      ? 'Persistenza web'
      : runtime === 'browser-memory-fallback'
        ? 'Fallback browser'
        : 'In attesa'

const isToday = (value: string | null | undefined) => {
  if (!value) return false
  const today = new Date().toISOString().slice(0, 10)
  return value.slice(0, 10) === today
}

export const buildHomeOperationalModel = ({
  layout,
  items,
  summary,
  typeSummary,
  workspaceSummary,
  runtime,
  extraCatalog,
}: HomeOperationalModelInput): HomeOperationalModel => {
  const occupiedOrReserved = summary.occupied + summary.reserved
  const occupancyRate = summary.total > 0 ? Math.round((occupiedOrReserved / summary.total) * 100) : 0
  const activeAccounts = items.flatMap((item) => (item.activeAccount?.active ? [{ item, account: item.activeAccount }] : []))
  const activeReservations = items.flatMap((item) =>
    item.currentReservation?.active ? [{ item, reservation: item.currentReservation }] : [],
  )
  const accountsWithBalance = activeAccounts.filter(({ account }) => account.balanceAmountCents > 0)
  const totalDueCents = activeAccounts.reduce((total, { account }) => total + account.totalAmountCents, 0)
  const residualOpenCents = activeAccounts.reduce((total, { account }) => total + account.balanceAmountCents, 0)
  const paidKnownCents = activeAccounts.reduce((total, { account }) => total + account.paidAmountCents, 0)
  const missingCustomerReservations = activeReservations.filter(({ item }) => !item.assignedCustomer).length
  const missingPeriodReservations = activeReservations.filter(({ reservation }) => !reservation.startDate || !reservation.endDate).length
  const missingAccountReservations = activeReservations.filter(({ reservation }) => !reservation.accountId).length
  const expiringToday = activeReservations.filter(({ reservation }) => isToday(reservation.endDate)).length
  const activeCatalogItems = extraCatalog.filter((entry) => entry.active)
  const placesWithoutCustomer = items.filter((item) => !item.assignedCustomer).length

  const accountRows: HomeTableRow[] = activeAccounts.slice(0, 5).map(({ item, account }) => ({
    key: account.id,
    place: getBeachDisplayCode(item, items),
    customer: item.assignedCustomer?.customer.fullName ?? 'Nessun cliente',
    period: item.currentReservation
      ? formatDateRangeItalian(item.currentReservation.startDate, item.currentReservation.endDate)
      : account.seasonLabel ?? 'Periodo non impostato',
    amount: formatEuroFromCents(account.balanceAmountCents),
    state: accountStatusLabels[account.status],
    action: 'Registro',
    module: 'registry',
  }))

  const reservationRows: HomeTableRow[] = activeReservations.slice(0, 6).map(({ item, reservation }) => ({
    key: reservation.id,
    place: getBeachDisplayCode(item, items),
    customer: item.assignedCustomer?.customer.fullName ?? 'Nessun cliente',
    period: formatDateRangeItalian(reservation.startDate, reservation.endDate),
    state: `${reservationTypeLabels[reservation.reservationType]} · ${reservationStatusLabels[reservation.status]}`,
    action: 'Posto',
    module: 'activeLayout',
  }))

  const recentActivity: HomeActivityRow[] = [
    ...activeAccounts.slice(0, 3).map(({ item, account }) => ({
      key: `account-${account.id}`,
      time: account.updatedAt ? account.updatedAt.slice(0, 10) : 'sessione',
      origin: 'Conti',
      event: `${getBeachDisplayCode(item, items)} · ${item.assignedCustomer?.customer.fullName ?? 'cliente non assegnato'}`,
      amount: formatEuroFromCents(account.balanceAmountCents),
      state: accountStatusLabels[account.status],
      module: 'registry' as const,
    })),
    ...activeReservations.slice(0, 3).map(({ item, reservation }) => ({
      key: `reservation-${reservation.id}`,
      time: reservation.updatedAt ? reservation.updatedAt.slice(0, 10) : 'sessione',
      origin: 'Prenotazioni',
      event: `${getBeachDisplayCode(item, items)} · ${reservationTypeLabels[reservation.reservationType]}`,
      amount: '-',
      state: reservationStatusLabels[reservation.status],
      module: 'activeLayout' as const,
    })),
  ].slice(0, 6)

  const priorityQueueItems: Array<HomePriorityQueueItem | null> = [
    summary.maintenance > 0
      ? {
          id: 'maintenance',
          domain: 'beach',
          severity: 'warning',
          title: 'Posti in manutenzione',
          description: `${summary.maintenance} posizioni richiedono controllo in Spiaggia.`,
          targetAction: 'Controlla',
          targetModule: 'activeLayout',
        }
      : null,
    accountsWithBalance.length > 0
      ? {
          id: 'account-balance',
          domain: 'account',
          severity: 'warning',
          title: 'Residui da incassare',
          description: `${accountsWithBalance.length} conti hanno saldo aperto.`,
          targetAction: 'Incassa',
          targetModule: 'registry',
        }
      : null,
    missingAccountReservations > 0
      ? {
          id: 'reservation-account',
          domain: 'reservation',
          severity: 'warning',
          title: 'Prenotazioni senza conto',
          description: `${missingAccountReservations} prenotazioni attive non risultano collegate a un conto.`,
          targetAction: 'Collega',
          targetModule: 'activeLayout',
        }
      : null,
    missingCustomerReservations > 0
      ? {
          id: 'reservation-customer',
          domain: 'reservation',
          severity: 'warning',
          title: 'Clienti mancanti',
          description: `${missingCustomerReservations} prenotazioni attive non hanno cliente assegnato.`,
          targetAction: 'Completa',
          targetModule: 'clients',
        }
      : null,
    missingPeriodReservations > 0
      ? {
          id: 'reservation-period',
          domain: 'reservation',
          severity: 'warning',
          title: 'Periodi incompleti',
          description: `${missingPeriodReservations} prenotazioni attive non hanno periodo completo.`,
          targetAction: 'Verifica',
          targetModule: 'activeLayout',
        }
      : null,
    activeCatalogItems.length === 0
      ? {
          id: 'catalog-empty',
          domain: 'catalog',
          severity: 'info',
          title: 'Catalogo da verificare',
          description: 'Nessun articolo extra attivo rilevato nel catalogo locale.',
          targetAction: 'Verifica',
          targetModule: 'priceList',
        }
      : null,
    {
      id: 'bar-not-configured',
      domain: 'bar',
      severity: 'info',
      title: 'Bar non configurato',
      description: 'Comande, banco e incassi bar non sono attivi in questa build.',
      targetAction: 'Configura',
      targetModule: 'priceList',
    },
    {
      id: 'studio-boundary',
      domain: 'studio',
      severity: 'info',
      title: 'Studio separato',
      description: 'Bozze e pubblicazione restano separate dal layout operativo attivo.',
      targetAction: 'Verifica',
      targetModule: 'studioProjects',
    },
  ]
  const priorityQueue = priorityQueueItems.filter((item): item is HomePriorityQueueItem => item !== null)

  return {
    currentDate: currentDateLabel(),
    lidoName: DEFAULT_WORKSPACE_NAME,
    header: {
      beach: `${occupiedOrReserved}/${summary.total} impegnati`,
      bar: 'non configurato',
      accounts: `${activeAccounts.length} conti aperti`,
      studio: 'bozza separata',
      runtime: runtimeLabel(runtime),
    },
    beachStatus: {
      totalPlaces: summary.total,
      freePlaces: summary.free,
      occupiedPlaces: summary.occupied,
      reservedPlaces: summary.reserved,
      maintenancePlaces: summary.maintenance,
      activeReservations: workspaceSummary.activeReservations,
      openAccounts: workspaceSummary.openAccounts,
      pendingAccounts: accountsWithBalance.length,
      occupancyRate,
      composition: `${typeSummary.palms} palme · ${typeSummary.umbrellas} ombrelloni · ${typeSummary.smallPalms} palmette`,
    },
    barStatus: {
      configured: false,
      openOrders: null,
      pendingOrders: null,
      barRevenueToday: null,
      barCatalogItems: 0,
      cashStatus: 'Non disponibile',
      disabledReason: 'Bar non configurato. Nessuna comanda o incasso simulato.',
    },
    financialStatus: {
      openAccounts: activeAccounts.length,
      pendingPayments: accountsWithBalance.length,
      totalDue: formatEuroFromCents(totalDueCents),
      collectedToday: paidKnownCents > 0 ? `${formatEuroFromCents(paidKnownCents)} registrati sui conti aperti` : 'N/D',
      residualOpen: formatEuroFromCents(residualOpenCents),
      accountsToPrepare: activeReservations.filter(({ reservation }) => !reservation.accountId).length,
      accountsWithBalance: accountsWithBalance.length,
    },
    reservationsStatus: {
      active: activeReservations.length,
      upcoming: 0,
      expiringToday,
      missingCustomer: missingCustomerReservations,
      missingPeriod: missingPeriodReservations,
      missingAccount: missingAccountReservations,
    },
    registryStatus: {
      movementsToday: null,
      lastMovementAt: recentActivity[0]?.time ?? 'Nessun movimento recente',
      openIssues: accountsWithBalance.length + missingAccountReservations,
      totalCollected: paidKnownCents > 0 ? formatEuroFromCents(paidKnownCents) : 'N/D',
      totalDue: formatEuroFromCents(totalDueCents),
    },
    studioStatus: {
      activeDraftName: 'Studio Mappa',
      draftState: 'Separato dal layout attivo',
      warnings: 0,
      previewAvailable: false,
      publicationBlocked: false,
      lastEditedAt: 'N/D',
    },
    catalogStatus: {
      beachItemsActive: activeCatalogItems.length,
      barItemsActive: 0,
      missingPrices: null,
      inactiveRequiredItems: null,
      syncWithLayoutStatus: activeCatalogItems.length > 0 ? 'Catalogo locale attivo' : 'Da verificare',
    },
    customerStatus: {
      assignedCustomers: workspaceSummary.assignedCustomers,
      placesWithoutCustomer,
      reservationsWithoutCustomer: missingCustomerReservations,
      assignmentsMissingPeriod: missingPeriodReservations,
    },
    staffStatus: {
      registeredEmployees: 0,
      activeEmployees: 0,
      onShiftEmployees: 0,
      assignedBeach: 0,
      assignedBar: 0,
      stateLabel: 'nessun record',
    },
    commandActions: [
      { label: 'Apri Spiaggia', module: 'activeLayout', primary: true },
      { label: 'Nuova prenotazione', module: 'activeLayout' },
      { label: 'Nuovo cliente', module: 'clients' },
      { label: 'Apri Registro', module: 'registry' },
      { label: 'Apri Articoli', module: 'priceList' },
      { label: 'Apri Studio', module: 'studioProjects' },
      { label: 'Configura Bar', module: 'priceList', disabledReason: 'Modulo Bar non attivo: prepara il catalogo da Articoli.' },
    ],
    accountRows,
    reservationRows,
    recentActivity,
    priorityQueue,
  }
}
