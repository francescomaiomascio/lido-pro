export type MapStudioDomainId =
  | 'perimeter'
  | 'functional-areas'
  | 'tracks'
  | 'footprints'
  | 'constraints'
  | 'validation'
  | 'versions'

export interface MapStudioDomain {
  id: MapStudioDomainId
  label: string
  shortLabel: string
  description: string
}

export const mapStudioDomains: MapStudioDomain[] = [
  {
    id: 'perimeter',
    label: 'Perimetro',
    shortLabel: 'Perimetro',
    description: 'Dimensioni spiaggia, lato mare, confine utile e confini tecnici.',
  },
  {
    id: 'functional-areas',
    label: 'Aree funzionali',
    shortLabel: 'Aree',
    description: 'Mare, ingresso, palme, ombrelloni, palmette, vuoti e aree non utilizzabili.',
  },
  {
    id: 'tracks',
    label: 'Tracciati',
    shortLabel: 'Tracciati',
    description: 'Assi di allineamento, gruppi riga e corsie di distribuzione.',
  },
  {
    id: 'footprints',
    label: 'Ingombri',
    shortLabel: 'Ingombri',
    description: 'Dimensioni fisiche degli oggetti e clearance attorno agli elementi.',
  },
  {
    id: 'constraints',
    label: 'Vincoli metrici',
    shortLabel: 'Vincoli',
    description: 'Minimi metrici, margini, separazioni zona e regole collisione.',
  },
  {
    id: 'validation',
    label: 'Verifica',
    shortLabel: 'Verifica',
    description: 'Prontezza calcolo, warning, conflitti e disponibilita anteprima.',
  },
  {
    id: 'versions',
    label: 'Versioni / Pubblicazione',
    shortLabel: 'Versioni',
    description: 'Layout attivo protetto, configurazione progetto e anteprima.',
  },
]

export const getMapStudioDomain = (id: MapStudioDomainId) =>
  mapStudioDomains.find((domain) => domain.id === id) ?? mapStudioDomains[0]
