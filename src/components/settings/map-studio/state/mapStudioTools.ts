import type { MapStudioDomainId } from '../mapStudioDomains'

export type MapStudioToolId =
  | 'select'
  | 'measure'
  | 'perimeterEdit'
  | 'areaEdit'
  | 'trackEdit'
  | 'footprintEdit'
  | 'constraintEdit'
  | 'verify'
  | 'preview'

export interface MapStudioTool {
  id: MapStudioToolId
  label: string
  shortLabel: string
  description: string
}

export const mapStudioTools: MapStudioTool[] = [
  { id: 'select', label: 'Seleziona', shortLabel: 'Sel', description: 'Seleziona scope sulla tavola senza modificare.' },
  { id: 'measure', label: 'Misura', shortLabel: 'Mis', description: 'Misura distanze e relazioni senza mutare il progetto.' },
  { id: 'perimeterEdit', label: 'Perimetro', shortLabel: 'Per', description: 'Mostra handle di bordo, lato mare e margini.' },
  { id: 'areaEdit', label: 'Aree', shortLabel: 'Aree', description: 'Mostra handle per profondita e bande funzionali.' },
  { id: 'trackEdit', label: 'Tracciati', shortLabel: 'Tr', description: 'Mostra handle per righe, posizioni e spaziature.' },
  { id: 'footprintEdit', label: 'Ingombri', shortLabel: 'Ing', description: 'Mostra footprint, clearance e radius handle degli oggetti.' },
  { id: 'constraintEdit', label: 'Vincoli', shortLabel: 'Vin', description: 'Mostra handle metrici e regole correlate.' },
  { id: 'verify', label: 'Verifica', shortLabel: 'Chk', description: 'Ispeziona stato di verifica e warning.' },
  { id: 'preview', label: 'Anteprima', shortLabel: 'Prev', description: 'Ispeziona la bozza calcolata quando disponibile.' },
]

const toolOrderByDomain: Record<MapStudioDomainId, MapStudioToolId[]> = {
  perimeter: ['select', 'measure', 'perimeterEdit', 'areaEdit', 'trackEdit', 'footprintEdit', 'constraintEdit', 'verify', 'preview'],
  functionalAreas: ['select', 'areaEdit', 'measure', 'trackEdit', 'footprintEdit', 'constraintEdit', 'perimeterEdit', 'verify', 'preview'],
  tracks: ['select', 'trackEdit', 'measure', 'areaEdit', 'constraintEdit', 'footprintEdit', 'perimeterEdit', 'verify', 'preview'],
  footprints: ['select', 'footprintEdit', 'measure', 'constraintEdit', 'trackEdit', 'areaEdit', 'perimeterEdit', 'verify', 'preview'],
  metricConstraints: ['select', 'constraintEdit', 'measure', 'trackEdit', 'footprintEdit', 'areaEdit', 'perimeterEdit', 'verify', 'preview'],
  verification: ['verify', 'select', 'measure', 'constraintEdit', 'preview', 'perimeterEdit', 'areaEdit', 'trackEdit', 'footprintEdit'],
  versionsPublication: ['preview', 'verify', 'select', 'measure', 'constraintEdit', 'perimeterEdit', 'areaEdit', 'trackEdit', 'footprintEdit'],
}

export const defaultToolForDomain = (domainId: MapStudioDomainId): MapStudioToolId => {
  if (domainId === 'perimeter') return 'perimeterEdit'
  if (domainId === 'functionalAreas') return 'areaEdit'
  if (domainId === 'tracks') return 'trackEdit'
  if (domainId === 'footprints') return 'footprintEdit'
  if (domainId === 'metricConstraints') return 'constraintEdit'
  if (domainId === 'verification') return 'verify'
  return 'preview'
}

export const toolsForDomain = (domainId: MapStudioDomainId) =>
  toolOrderByDomain[domainId].map((id) => mapStudioTools.find((tool) => tool.id === id)!).filter(Boolean)

export const getMapStudioTool = (toolId: MapStudioToolId) =>
  mapStudioTools.find((tool) => tool.id === toolId) ?? mapStudioTools[0]
