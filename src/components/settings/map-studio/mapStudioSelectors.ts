import type { BeachDistanceRules } from '../../../lib/map-canvas'
import type {
  ParametricSetupAssetMetric,
  ParametricSetupRow,
  ParametricSetupState,
  ParametricSetupZone,
} from '../../../lib/map-canvas/parametric/parametricSetupState'
import type { MapStudioDomainId } from './mapStudioDomains'
import type { MapStudioProjectState } from './MapStudioProjectState'

export interface MapStudioContextModel {
  title: string
  subtitle: string
  scopeLabel: string
  areas: ParametricSetupZone[]
  tracks: ParametricSetupRow[]
  assets: ParametricSetupAssetMetric[]
  constraints: Array<{ label: string; key: keyof BeachDistanceRules; hint: string }>
  primaryActionLabel: string
}

const familyConstraintKeys = (family?: string): Array<keyof BeachDistanceRules> => {
  if (family === 'umbrella') return ['minUmbrellaGapM', 'minUmbrellaRowGapM', 'minMixedAssetGapM', 'minZoneGapM', 'marginFromBoundaryM']
  if (family === 'small_palm') return ['minSmallPalmGapM', 'minMixedAssetGapM', 'minZoneGapM', 'marginFromBoundaryM']
  if (family === 'palm') return ['minPalmGapM', 'minPalmRowGapM', 'minMixedAssetGapM', 'minZoneGapM', 'marginFromBoundaryM']
  return ['minPalmGapM', 'minUmbrellaGapM', 'minSmallPalmGapM', 'minMixedAssetGapM', 'minZoneGapM', 'marginFromBoundaryM']
}

const actionForDomain = (domain: MapStudioDomainId) => {
  if (domain === 'tracks') return 'Evidenzia tracciati'
  if (domain === 'constraints') return 'Verifica vincoli'
  if (domain === 'validation') return 'Esegui verifica'
  if (domain === 'versions') return 'Apri anteprima'
  if (domain === 'footprints') return 'Mostra ingombri'
  if (domain === 'functional-areas') return 'Evidenzia area'
  return 'Aggiorna perimetro'
}

export function buildMapStudioContext(input: {
  setup: ParametricSetupState
  state: MapStudioProjectState
  distanceRows: Array<{ label: string; key: keyof BeachDistanceRules; hint: string }>
}): MapStudioContextModel {
  const { setup, state, distanceRows } = input
  const selectedArea = state.selectedAreaId ? setup.zones.find((zone) => zone.id === state.selectedAreaId) : undefined
  const selectedTrack = state.selectedTrackId ? setup.rows.find((row) => row.id === state.selectedTrackId) : undefined
  const impliedArea = selectedTrack ? setup.zones.find((zone) => zone.id === selectedTrack.zoneId) : undefined
  const activeArea = selectedArea ?? impliedArea
  const areas = activeArea ? [activeArea] : setup.zones
  const tracks = selectedTrack
    ? [selectedTrack]
    : activeArea
      ? setup.rows.filter((row) => row.zoneId === activeArea.id)
      : setup.rows
  const families = new Set<string>(tracks.map((track) => track.family))
  const assets = families.size ? setup.assetMetrics.filter((asset) => families.has(asset.family)) : setup.assetMetrics
  const preferredKeys = familyConstraintKeys(selectedTrack?.family ?? tracks[0]?.family)
  const constraints = [
    ...distanceRows.filter((row) => preferredKeys.includes(row.key)),
    ...distanceRows.filter((row) => !preferredKeys.includes(row.key)),
  ]
  const itemCount = tracks.reduce((total, track) => total + track.itemCount, 0)
  const title = selectedTrack
    ? `Tracciato ${selectedTrack.label}`
    : activeArea
      ? activeArea.label
      : setup.beach.name
  const subtitle = activeArea
    ? `${tracks.map((track) => track.label).join(', ') || 'nessun tracciato'} · ${itemCount} elementi`
    : `${setup.zones.length} aree · ${setup.rows.length} tracciati · ${setup.assetMetrics.length} ingombri`

  return {
    title,
    subtitle,
    scopeLabel: activeArea ? 'Scope area' : 'Scope progetto',
    areas,
    tracks,
    assets,
    constraints,
    primaryActionLabel: actionForDomain(state.activeDomain),
  }
}
