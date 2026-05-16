export type MapCanvasToolId =
  | 'select'
  | 'pan'
  | 'inspect'
  | 'validate'
  | 'move_planned'
  | 'add_asset_planned'
  | 'zone_planned'
  | 'walkway_planned'
  | 'layout_rules_planned'

export type MapCanvasStudioToolId =
  | 'surface'
  | 'grid'
  | 'rendering'
  | 'assets'
  | 'umbrellas'
  | 'palms'
  | 'zones'
  | 'walkways'
  | 'validate'

export type MapToolSurface = 'view' | 'canvas_studio' | 'element_action' | 'planned_layout'

export interface MapCanvasToolDefinition {
  id: MapCanvasToolId
  label: string
  description: string
  surface: MapToolSurface
  availableInWorkMode: boolean
  availableInEditMode: boolean
  enabled: boolean
  planned: boolean
}

export interface MapCanvasStudioToolDefinition {
  id: MapCanvasStudioToolId
  label: string
  shortLabel: string
  description: string
  surface: 'canvas_studio'
  enabled: boolean
  planned: boolean
}

export type MapToolsPanelState = {
  isOpen: boolean
  activeToolId: MapCanvasToolId
}

export type CanvasStudioRailState = {
  isOpen: boolean
  activeToolId: MapCanvasStudioToolId
}

export const mapCanvasTools: MapCanvasToolDefinition[] = [
  {
    id: 'select',
    label: 'Seleziona',
    description: 'Selezione elementi e apertura azioni rapide.',
    surface: 'element_action',
    availableInWorkMode: true,
    availableInEditMode: true,
    enabled: true,
    planned: false,
  },
  {
    id: 'pan',
    label: 'Pan',
    description: 'Spostamento della vista Canvas.',
    surface: 'view',
    availableInWorkMode: true,
    availableInEditMode: true,
    enabled: true,
    planned: false,
  },
  {
    id: 'inspect',
    label: 'Ispeziona',
    description: 'Lettura tecnica dell’elemento selezionato.',
    surface: 'element_action',
    availableInWorkMode: true,
    availableInEditMode: true,
    enabled: true,
    planned: false,
  },
  {
    id: 'validate',
    label: 'Valida layout',
    description: 'Controlli read-only sul layout corrente.',
    surface: 'canvas_studio',
    availableInWorkMode: true,
    availableInEditMode: true,
    enabled: true,
    planned: false,
  },
  {
    id: 'move_planned',
    label: 'Modifica layout',
    description: 'Strumenti globali di modifica layout previsti in una wave futura.',
    surface: 'planned_layout',
    availableInWorkMode: false,
    availableInEditMode: true,
    enabled: false,
    planned: true,
  },
  {
    id: 'add_asset_planned',
    label: 'Aggiungi elemento',
    description: 'Creazione asset prevista in una wave futura.',
    surface: 'planned_layout',
    availableInWorkMode: false,
    availableInEditMode: true,
    enabled: false,
    planned: true,
  },
  {
    id: 'zone_planned',
    label: 'Zone',
    description: 'Editor zone previsto in una wave futura.',
    surface: 'planned_layout',
    availableInWorkMode: false,
    availableInEditMode: true,
    enabled: false,
    planned: true,
  },
  {
    id: 'walkway_planned',
    label: 'Passerelle',
    description: 'Editor passerelle previsto in una wave futura.',
    surface: 'planned_layout',
    availableInWorkMode: false,
    availableInEditMode: true,
    enabled: false,
    planned: true,
  },
  {
    id: 'layout_rules_planned',
    label: 'Regole layout',
    description: 'Applicazione vincoli prevista dopo gli strumenti di modifica.',
    surface: 'planned_layout',
    availableInWorkMode: false,
    availableInEditMode: true,
    enabled: false,
    planned: true,
  },
]

export const canvasStudioTools: MapCanvasStudioToolDefinition[] = [
  {
    id: 'surface',
    label: 'Superficie',
    shortLabel: 'Surf',
    description: 'Preset sfondo, texture, mare e profondità.',
    surface: 'canvas_studio',
    enabled: true,
    planned: false,
  },
  {
    id: 'grid',
    label: 'Griglia',
    shortLabel: 'Grid',
    description: 'Visibilità, opacità, passo e linee metriche.',
    surface: 'canvas_studio',
    enabled: true,
    planned: false,
  },
  {
    id: 'rendering',
    label: 'Rendering',
    shortLabel: 'Rend',
    description: 'Scala elementi, label, ombre e selezione.',
    surface: 'canvas_studio',
    enabled: true,
    planned: false,
  },
  {
    id: 'assets',
    label: 'Asset',
    shortLabel: 'Asset',
    description: 'Home rapida della libreria grafica.',
    surface: 'canvas_studio',
    enabled: true,
    planned: false,
  },
  {
    id: 'umbrellas',
    label: 'Ombrelloni',
    shortLabel: 'Omb',
    description: 'Varianti ombrelloni disponibili e previste.',
    surface: 'canvas_studio',
    enabled: true,
    planned: false,
  },
  {
    id: 'palms',
    label: 'Palme',
    shortLabel: 'Pal',
    description: 'Varianti palma disponibili e previste.',
    surface: 'canvas_studio',
    enabled: true,
    planned: false,
  },
  {
    id: 'zones',
    label: 'Zone',
    shortLabel: 'Zone',
    description: 'Struttura zone prevista in sola preview.',
    surface: 'canvas_studio',
    enabled: true,
    planned: true,
  },
  {
    id: 'walkways',
    label: 'Passerelle',
    shortLabel: 'Pass',
    description: 'Materiali e moduli passerelle previsti.',
    surface: 'canvas_studio',
    enabled: true,
    planned: true,
  },
  {
    id: 'validate',
    label: 'Valida',
    shortLabel: 'Val',
    description: 'Sintesi read-only dello stato layout.',
    surface: 'canvas_studio',
    enabled: true,
    planned: false,
  },
]
