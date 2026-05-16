import type { MapStudioDomainId } from '../mapStudioDomains'
import type { MapStudioLayerId } from '../mapStudioLayers'

export const layerVisible = (layers: MapStudioLayerId[], layer: MapStudioLayerId) => layers.includes(layer)

export const layerTone = (input: {
  activeDomain: MapStudioDomainId
  activeLayers: MapStudioLayerId[]
  layer: MapStudioLayerId
}) => {
  const active = layerVisible(input.activeLayers, input.layer)
  if (active) return 'strong'
  if (input.activeDomain === 'perimeter' && ['functional.areas', 'tracks.rows', 'object.footprints'].includes(input.layer)) return 'quiet'
  if (input.activeDomain === 'tracks' && input.layer === 'object.footprints') return 'quiet'
  if (input.activeDomain === 'metricConstraints' && ['functional.areas', 'tracks.rows', 'object.footprints'].includes(input.layer)) return 'medium'
  return 'muted'
}
