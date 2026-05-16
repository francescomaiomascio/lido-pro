import { assetMetricDefinitions } from '../assets/assetMetricDefinitions'
import type { BeachItem } from '../../types/beach'
import type { BeachMetricModel } from './beachMetricModel'

export type BeachMetricValidationSeverity = 'ok' | 'warning' | 'info'

export interface BeachMetricValidationMessage {
  severity: BeachMetricValidationSeverity
  title: string
  detail: string
}

export interface BeachMetricValidationResult {
  messages: BeachMetricValidationMessage[]
  expectedRowsPresent: boolean
  countMatchesModel: boolean
  missingMetricAssetFamilies: string[]
}

export function validateBeachMetricModel(input: {
  model: BeachMetricModel
  items: BeachItem[]
}): BeachMetricValidationResult {
  const messages: BeachMetricValidationMessage[] = []
  const rowIds = new Set(input.items.map((item) => item.rowLabel))
  const expectedRowsPresent = input.model.rows.every((row) => rowIds.has(row.id))
  const countMatchesModel = input.items.length === input.model.capacity.totalItems
  const definedFamilies = new Set(assetMetricDefinitions.map((definition) => definition.family))
  const requiredFamilies = new Set(['umbrella', 'palm', 'small_palm'])
  const missingMetricAssetFamilies = [...requiredFamilies].filter((family) => !definedFamilies.has(family as never))

  messages.push({
    severity: countMatchesModel ? 'ok' : 'warning',
    title: 'Conteggio elementi',
    detail: countMatchesModel
      ? `${input.items.length} elementi coerenti con il modello metrico draft.`
      : `Attesi ${input.model.capacity.totalItems}, trovati ${input.items.length}.`,
  })
  messages.push({
    severity: expectedRowsPresent ? 'ok' : 'warning',
    title: 'Righe attese',
    detail: expectedRowsPresent
      ? 'P1/P2/P3/P4/O1/O2/PM presenti nel layout attivo.'
      : 'Una o più righe attese non sono presenti nel layout attivo.',
  })
  messages.push({
    severity: missingMetricAssetFamilies.length === 0 ? 'ok' : 'warning',
    title: 'Dimensioni asset',
    detail: missingMetricAssetFamilies.length === 0
      ? 'Ombrelloni, palme e palme piccole hanno definizioni metriche iniziali.'
      : `Famiglie senza definizione metrica: ${missingMetricAssetFamilies.join(', ')}.`,
  })
  messages.push({
    severity: input.model.zones.length > 0 ? 'ok' : 'warning',
    title: 'Zone superficie',
    detail: input.model.zones.length > 0
      ? `${input.model.zones.length} zone metriche primarie definite in sola lettura.`
      : 'Zone superficie non definite.',
  })
  messages.push({
    severity: 'info',
    title: 'Distanze draft',
    detail: `Palme ${input.model.distances.minPalmGapM}m · Ombrelloni ${input.model.distances.minUmbrellaGapM}m · Miste ${input.model.distances.minMixedAssetGapM}m.`,
  })

  return {
    messages,
    expectedRowsPresent,
    countMatchesModel,
    missingMetricAssetFamilies,
  }
}
