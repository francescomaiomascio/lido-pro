import type { BeachItem, BeachLayout } from '../types/beach'
import type { ParametricLayoutBundle } from '../map-canvas/parametric/parametricLayoutTypes'

export type LayoutProjectionSource = 'projectDraft' | 'layoutPreview' | 'activeLayoutProjection'

export type ProjectDraftLayout = {
  source: 'projectDraft'
  bundle: ParametricLayoutBundle
}

export type LayoutPreviewProjection = {
  source: 'layoutPreview'
  bundle: ParametricLayoutBundle
}

export type ActiveLayoutProjection = {
  source: 'activeLayoutProjection'
  layout: BeachLayout
  items: BeachItem[]
  protected: true
}

export type OperationalLayoutView = {
  source: 'activeLayoutProjection'
  layoutId: string
  layoutName: string
  itemCount: number
  items: BeachItem[]
}

export const layoutProjectionBoundary = {
  projectDraft:
    'Configurazione progettuale modificabile nello Studio / Progetti.',
  layoutPreview:
    'Proposta verificabile generata da una bozza prima della pubblicazione.',
  activeLayoutProjection:
    'Layout operativo protetto consumato da Spiaggia.',
  operationalLayoutView:
    'Vista di lavoro per prenotazioni, clienti, periodi e conti locali.',
} as const

export const createActiveLayoutProjection = (
  layout: BeachLayout,
  items: BeachItem[],
): ActiveLayoutProjection => ({
  source: 'activeLayoutProjection',
  layout,
  items,
  protected: true,
})

export const createOperationalLayoutView = (
  projection: ActiveLayoutProjection,
): OperationalLayoutView => ({
  source: 'activeLayoutProjection',
  layoutId: projection.layout.id,
  layoutName: projection.layout.name,
  itemCount: projection.items.length,
  items: projection.items,
})

export const isActiveLayoutProjection = (
  projection: { source?: string } | null | undefined,
): projection is ActiveLayoutProjection => projection?.source === 'activeLayoutProjection'

export const describeLayoutProjectionSource = (
  source: LayoutProjectionSource,
): string => layoutProjectionBoundary[source]

export const assertOperationalLayoutSource = (
  projection: { source?: string } | null | undefined,
): asserts projection is ActiveLayoutProjection => {
  if (!isActiveLayoutProjection(projection)) {
    throw new Error('Spiaggia can only consume activeLayoutProjection.')
  }
}
