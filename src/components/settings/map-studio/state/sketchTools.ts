import type { MapStudioToolId } from './mapStudioTools'

export type SketchCommandId =
  | 'select'
  | 'pan'
  | 'fit'
  | 'measure'
  | 'perimeter'
  | 'seaEdge'
  | 'margin'
  | 'area'
  | 'track'
  | 'footprint'
  | 'constraint'
  | 'verify'
  | 'preview'

export type SketchCommandGroupId = 'navigation' | 'sketch' | 'inspect'

export interface SketchCommand {
  id: SketchCommandId
  studioToolId?: MapStudioToolId
  group: SketchCommandGroupId
  label: string
  shortLabel: string
  prompt: string
  blockedReason?: string
}

export const sketchCommands: SketchCommand[] = [
  {
    id: 'select',
    studioToolId: 'select',
    group: 'navigation',
    label: 'Seleziona',
    shortLabel: 'Sel',
    prompt: 'Seleziona un bordo, una quota o una entita sketch per vedere proprieta e handle.',
  },
  {
    id: 'pan',
    group: 'navigation',
    label: 'Pan',
    shortLabel: 'Pan',
    prompt: 'Trascina il canvas per spostare la vista senza modificare il progetto.',
  },
  {
    id: 'fit',
    group: 'navigation',
    label: 'Adatta',
    shortLabel: 'Fit',
    prompt: 'Riporta il progetto al centro del viewport.',
  },
  {
    id: 'measure',
    studioToolId: 'measure',
    group: 'inspect',
    label: 'Misura',
    shortLabel: 'Mis',
    prompt: 'Trascina tra due punti o entita: la quota e temporanea e non modifica il modello.',
  },
  {
    id: 'perimeter',
    studioToolId: 'perimeterEdit',
    group: 'sketch',
    label: 'Perimetro',
    shortLabel: 'Per',
    prompt: 'Perimetro: trascina lato destro, lato basso o angolo per proporre nuove dimensioni.',
  },
  {
    id: 'seaEdge',
    studioToolId: 'perimeterEdit',
    group: 'sketch',
    label: 'Lato mare',
    shortLabel: 'Mare',
    prompt: 'Lato mare: scegli il bordo che rappresenta il fronte mare del progetto.',
  },
  {
    id: 'margin',
    studioToolId: 'perimeterEdit',
    group: 'sketch',
    label: 'Margini',
    shortLabel: 'Marg',
    prompt: 'Margini: regola le guide offset che delimitano il perimetro utile.',
  },
  {
    id: 'area',
    studioToolId: 'areaEdit',
    group: 'sketch',
    label: 'Area',
    shortLabel: 'Area',
    prompt: 'Area: seleziona o crea una fascia funzionale dentro il perimetro.',
  },
  {
    id: 'track',
    studioToolId: 'trackEdit',
    group: 'sketch',
    label: 'Tracciato',
    shortLabel: 'Fila',
    prompt: 'Tracciato: clicca dentro un area per aggiungere o regolare una fila.',
  },
  {
    id: 'footprint',
    studioToolId: 'footprintEdit',
    group: 'sketch',
    label: 'Ingombro',
    shortLabel: 'Ing',
    prompt: 'Ingombro: seleziona un tipo oggetto e modifica footprint o clearance.',
  },
  {
    id: 'constraint',
    studioToolId: 'constraintEdit',
    group: 'sketch',
    label: 'Vincolo',
    shortLabel: 'Vin',
    prompt: 'Vincolo: seleziona due entita o una quota per definire una regola metrica.',
  },
  {
    id: 'verify',
    studioToolId: 'verify',
    group: 'inspect',
    label: 'Verifica',
    shortLabel: 'Chk',
    prompt: 'Verifica: ispeziona warning e stato del modello prima di generare anteprima.',
  },
  {
    id: 'preview',
    studioToolId: 'preview',
    group: 'inspect',
    label: 'Preview',
    shortLabel: 'Prev',
    prompt: 'Anteprima: confronta la bozza generata senza applicarla alla produzione.',
  },
]

export const getSketchCommand = (id: SketchCommandId) =>
  sketchCommands.find((command) => command.id === id) ?? sketchCommands[0]

export const sketchCommandForStudioTool = (toolId: MapStudioToolId): SketchCommandId => {
  if (toolId === 'measure') return 'measure'
  if (toolId === 'perimeterEdit') return 'perimeter'
  if (toolId === 'areaEdit') return 'area'
  if (toolId === 'trackEdit') return 'track'
  if (toolId === 'footprintEdit') return 'footprint'
  if (toolId === 'constraintEdit') return 'constraint'
  if (toolId === 'verify') return 'verify'
  if (toolId === 'preview') return 'preview'
  return 'select'
}

export const sketchCommandGroups: Array<{
  id: SketchCommandGroupId
  label: string
  commandIds: SketchCommandId[]
}> = [
  { id: 'navigation', label: 'Navigate', commandIds: ['select', 'pan', 'fit'] },
  { id: 'sketch', label: 'Sketch', commandIds: ['perimeter', 'seaEdge', 'margin', 'area', 'track', 'footprint', 'constraint'] },
  { id: 'inspect', label: 'Inspect', commandIds: ['measure', 'verify', 'preview'] },
]
