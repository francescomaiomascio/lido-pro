import type { ParametricLayoutOutput } from '../../../../lib/map-canvas/parametric/parametricLayoutEngine'
import type { ParametricSetupState } from '../../../../lib/map-canvas/parametric/parametricSetupState'

export type MapStudioDashboardView =
  | 'projects'
  | 'drafts'
  | 'activeLayout'
  | 'versions'
  | 'importExport'
  | 'publish'

export type MapStudioDashboardProjectKind = 'draft' | 'active' | 'base' | 'imported'
export type MapStudioDashboardProjectStatus = 'draft' | 'active' | 'base' | 'verified' | 'blocked' | 'imported'

export interface MapStudioDashboardSummaryItem {
  id: string
  label: string
  title: string
  detail: string
  meta?: string
  tone: 'protected' | 'draft' | 'diff' | 'history' | 'status'
  actionLabel: string
  disabledReason?: string
}

export interface MapStudioDashboardProject {
  id: string
  name: string
  kind: MapStudioDashboardProjectKind
  status: MapStudioDashboardProjectStatus
  statusLabel: string
  dimensionsLabel: string
  elementCount: number
  elementDelta?: number
  areaCount: number
  trackCount: number
  warningCount: number
  warningDelta?: number
  lastModifiedLabel: string
  sourceLabel: string
  canOpenDraft: boolean
  canDuplicate: boolean
  canExport: boolean
  canDelete: boolean
  canPublish: boolean
  disabledPublishReason?: string
  diff: {
    elements: number
    moved: number
    added: number
    removed: number
    warnings: number
  }
}

export interface MapStudioDashboardVersion {
  id: string
  dateLabel: string
  sourceLabel: string
  current?: boolean
}

export interface MapStudioDashboardBackup {
  id: string
  dateLabel: string
  modeLabel: string
  sizeLabel: string
}

export interface MapStudioDashboardModel {
  beachName: string
  dimensionsLabel: string
  elementCount: number
  areaCount: number
  trackCount: number
  warningCount: number
  currentDraftName: string
  currentTimestampLabel: string
  projectStateLabel: string
  summaries: MapStudioDashboardSummaryItem[]
  projects: MapStudioDashboardProject[]
  versions: MapStudioDashboardVersion[]
  backups: MapStudioDashboardBackup[]
}

const formatDelta = (value: number) => value === 0 ? undefined : value

export const dashboardStatusLabel = (status: MapStudioDashboardProjectStatus) => {
  if (status === 'active') return 'Attivo'
  if (status === 'base') return 'Base'
  if (status === 'verified') return 'Verificata'
  if (status === 'blocked') return 'Bloccata'
  if (status === 'imported') return 'Importata'
  return 'Bozza'
}

export const buildMapStudioDashboardModel = (
  setup: ParametricSetupState,
  input: {
    output?: ParametricLayoutOutput | null
    draftAvailable: boolean
  },
): MapStudioDashboardModel => {
  const elementCount = setup.rows.reduce((total, row) => total + row.itemCount, 0)
  const areaCount = setup.zones.filter((zone) => zone.visible !== false && zone.heightM > 0).length
  const trackCount = setup.rows.length
  const warningCount = input.output?.warnings.length ?? 0
  const dimensionsLabel = `${setup.beach.widthM}m x ${setup.beach.depthM}m`
  const currentTimestampLabel = '17/05/2026, 07:40'
  const currentDraftName = input.draftAvailable ? 'Bozza estate 2026' : 'Nessuna bozza verificata'
  const projectStateLabel = input.draftAvailable ? 'In verifica' : 'Da impostare'

  const projects: MapStudioDashboardProject[] = [
    {
      id: 'draft-current',
      name: 'Bozza estate 2026',
      kind: 'draft',
      status: input.draftAvailable ? 'verified' : 'draft',
      statusLabel: input.draftAvailable ? 'In verifica' : 'Bozza',
      dimensionsLabel,
      elementCount,
      elementDelta: formatDelta(4),
      areaCount,
      trackCount,
      warningCount,
      warningDelta: formatDelta(-2),
      lastModifiedLabel: currentTimestampLabel,
      sourceLabel: 'Studio Mappa',
      canOpenDraft: true,
      canDuplicate: true,
      canExport: true,
      canDelete: true,
      canPublish: false,
      disabledPublishReason: 'Attivazione bloccata: serve verifica completa e publish flow esplicito.',
      diff: {
        elements: elementCount,
        moved: Math.max(0, elementCount - 4),
        added: 4,
        removed: 0,
        warnings: warningCount,
      },
    },
    {
      id: 'active-layout',
      name: `${setup.beach.name} · layout parametrico`,
      kind: 'active',
      status: 'active',
      statusLabel: 'Attivo',
      dimensionsLabel,
      elementCount,
      areaCount,
      trackCount,
      warningCount,
      lastModifiedLabel: '16/05/2026, 16:49',
      sourceLabel: 'Layout protetto',
      canOpenDraft: false,
      canDuplicate: true,
      canExport: true,
      canDelete: false,
      canPublish: false,
      disabledPublishReason: 'Il layout attivo e gia protetto: non puo essere attivato o cancellato.',
      diff: {
        elements: elementCount,
        moved: 0,
        added: 0,
        removed: 0,
        warnings: warningCount,
      },
    },
    {
      id: 'draft-spring',
      name: 'Bozza primavera 2026',
      kind: 'draft',
      status: 'draft',
      statusLabel: 'Bozza',
      dimensionsLabel,
      elementCount: Math.max(0, elementCount - 4),
      elementDelta: formatDelta(-4),
      areaCount,
      trackCount,
      warningCount: warningCount + 2,
      warningDelta: formatDelta(2),
      lastModifiedLabel: '12/05/2026, 10:21',
      sourceLabel: 'Studio Mappa',
      canOpenDraft: true,
      canDuplicate: true,
      canExport: true,
      canDelete: true,
      canPublish: false,
      disabledPublishReason: 'Bozza non verificata.',
      diff: {
        elements: Math.max(0, elementCount - 4),
        moved: Math.max(0, elementCount - 8),
        added: 0,
        removed: 4,
        warnings: warningCount + 2,
      },
    },
    {
      id: 'draft-events',
      name: 'Scenario eventi Luglio',
      kind: 'draft',
      status: 'blocked',
      statusLabel: 'Bloccata',
      dimensionsLabel,
      elementCount: elementCount + 4,
      elementDelta: formatDelta(4),
      areaCount,
      trackCount,
      warningCount: warningCount + 1,
      warningDelta: formatDelta(1),
      lastModifiedLabel: '08/05/2026, 15:12',
      sourceLabel: 'Studio Mappa',
      canOpenDraft: true,
      canDuplicate: true,
      canExport: true,
      canDelete: true,
      canPublish: false,
      disabledPublishReason: 'Warning bloccanti presenti.',
      diff: {
        elements: elementCount + 4,
        moved: Math.max(0, elementCount - 2),
        added: 6,
        removed: 2,
        warnings: warningCount + 1,
      },
    },
    {
      id: 'base-layout',
      name: 'Layout base canonico',
      kind: 'base',
      status: 'base',
      statusLabel: 'Base',
      dimensionsLabel,
      elementCount,
      areaCount,
      trackCount,
      warningCount,
      lastModifiedLabel: '03/05/2026, 09:05',
      sourceLabel: 'Template',
      canOpenDraft: true,
      canDuplicate: true,
      canExport: true,
      canDelete: false,
      canPublish: false,
      disabledPublishReason: 'Il template base va duplicato come bozza prima della pubblicazione.',
      diff: {
        elements: elementCount,
        moved: 0,
        added: 0,
        removed: 0,
        warnings: warningCount,
      },
    },
  ]

  return {
    beachName: setup.beach.name,
    dimensionsLabel,
    elementCount,
    areaCount,
    trackCount,
    warningCount,
    currentDraftName,
    currentTimestampLabel,
    projectStateLabel,
    summaries: [
      {
        id: 'active',
        label: 'Layout attivo protetto',
        title: `${setup.beach.name} · layout parametrico`,
        detail: `${dimensionsLabel} · ${elementCount} elementi · ${areaCount} aree`,
        tone: 'protected',
        actionLabel: 'Apri layout attivo',
        disabledReason: 'Vista protetta solo lettura non ancora disponibile in DASH.1.',
      },
      {
        id: 'draft',
        label: 'Bozza corrente',
        title: currentDraftName,
        detail: input.draftAvailable ? currentTimestampLabel : 'Crea una bozza o usa il layout base',
        meta: input.draftAvailable ? 'Bozza' : 'Non pronta',
        tone: 'draft',
        actionLabel: 'Apri bozza',
      },
      {
        id: 'diff',
        label: 'Diff attivo / bozza',
        title: `${elementCount} elementi · ${Math.max(0, elementCount - 4)} mossi`,
        detail: `${warningCount} warning · +4 aggiunti · 0 rimossi`,
        tone: 'diff',
        actionLabel: 'Confronta nel dettaglio',
        disabledReason: input.draftAvailable ? undefined : 'Serve una bozza per confrontare.',
      },
      {
        id: 'history',
        label: 'Ultima modifica',
        title: currentTimestampLabel,
        detail: 'di Studio Mappa',
        tone: 'history',
        actionLabel: 'Cronologia modifiche',
      },
      {
        id: 'state',
        label: 'Stato progetto',
        title: projectStateLabel,
        detail: input.draftAvailable ? 'Pronto per la revisione' : 'Nessuna bozza verificabile',
        tone: 'status',
        actionLabel: 'Vedi dettagli stato',
      },
    ],
    projects,
    versions: [
      { id: 'v3.2', dateLabel: currentTimestampLabel, sourceLabel: 'Studio Mappa', current: true },
      { id: 'v3.1', dateLabel: '16/05/2026, 16:49', sourceLabel: 'Layout attivo' },
      { id: 'v3.0', dateLabel: '12/05/2026, 10:21', sourceLabel: 'Studio Mappa' },
    ],
    backups: [
      { id: 'backup-1', dateLabel: currentTimestampLabel, modeLabel: 'Manuale', sizeLabel: '2.3 MB' },
      { id: 'backup-2', dateLabel: '16/05/2026, 16:49', modeLabel: 'Automatico', sizeLabel: '2.2 MB' },
      { id: 'backup-3', dateLabel: '15/05/2026, 18:10', modeLabel: 'Automatico', sizeLabel: '2.1 MB' },
    ],
  }
}
