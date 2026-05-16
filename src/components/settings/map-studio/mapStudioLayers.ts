import type { MapStudioDomainId } from './mapStudioDomains'

export type MapStudioLayerId =
  | 'base.surface'
  | 'sea.edge'
  | 'sand.surface'
  | 'usable.boundary'
  | 'functional.areas'
  | 'tracks.rows'
  | 'object.footprints'
  | 'metric.constraints'
  | 'calculation.preview'
  | 'warnings'
  | 'selection.focus'

export interface MapStudioLayer {
  id: MapStudioLayerId
  label: string
  description: string
  visibleInBar?: boolean
}

export const mapStudioLayers: MapStudioLayer[] = [
  { id: 'base.surface', label: 'Base', description: 'Base metrica del progetto.', visibleInBar: false },
  { id: 'sand.surface', label: 'Sabbia', description: 'Trattamento premium della sabbia.' },
  { id: 'sea.edge', label: 'Mare', description: 'Bordo mare e fascia di ingresso.' },
  { id: 'usable.boundary', label: 'Perimetro utile', description: 'Limite utilizzabile della configurazione.' },
  { id: 'functional.areas', label: 'Aree', description: 'Aree funzionali del progetto.' },
  { id: 'tracks.rows', label: 'Tracciati', description: 'Assi di distribuzione e gruppi riga.' },
  { id: 'object.footprints', label: 'Ingombri', description: 'Footprint e collisioni degli oggetti.' },
  { id: 'metric.constraints', label: 'Vincoli', description: 'Minimi metrici, margini e separazioni.' },
  { id: 'calculation.preview', label: 'Anteprima', description: 'Layout calcolato in bozza.' },
  { id: 'warnings', label: 'Warning', description: 'Conflitti e stati invalidi.' },
  { id: 'selection.focus', label: 'Focus', description: 'Evidenza dello scope selezionato.' },
]

export const domainLayerEmphasis: Record<MapStudioDomainId, MapStudioLayerId[]> = {
  perimeter: ['base.surface', 'sand.surface', 'sea.edge', 'usable.boundary', 'selection.focus'],
  'functional-areas': ['base.surface', 'sand.surface', 'functional.areas', 'selection.focus'],
  tracks: ['functional.areas', 'tracks.rows', 'selection.focus'],
  footprints: ['functional.areas', 'object.footprints', 'selection.focus'],
  constraints: ['usable.boundary', 'metric.constraints', 'selection.focus'],
  validation: ['calculation.preview', 'warnings', 'metric.constraints'],
  versions: ['base.surface', 'sand.surface', 'calculation.preview', 'warnings'],
}

export const layersForDomain = (domainId: MapStudioDomainId) => domainLayerEmphasis[domainId]
