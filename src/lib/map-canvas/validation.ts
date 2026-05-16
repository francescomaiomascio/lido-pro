import type { BeachItem } from '../types/beach'
import type { MapCanvasConfig } from './config'
import { doCanvasElementsOverlap, getCanvasElementBoundaryIssues } from './layoutRules'
import { projectCurrentLayoutToCanvasElements } from './currentLayoutProjection'
import type { CanvasMapElement } from './types'

export type MapCanvasValidationSeverity = 'error' | 'warning' | 'info'

export interface MapCanvasValidationMessage {
  severity: MapCanvasValidationSeverity
  title: string
  detail: string
}

export interface MapCanvasValidationResult {
  total: number
  byCodePrefix: Record<string, number>
  messages: MapCanvasValidationMessage[]
}

const knownAssetTypes = new Set(['palm', 'small_palm', 'umbrella'])

export function validateCurrentCanvasLayout(input: {
  items: BeachItem[]
  config: MapCanvasConfig
}): MapCanvasValidationResult {
  const elements = projectCurrentLayoutToCanvasElements(input.items)
  const messages: MapCanvasValidationMessage[] = []
  const byCodePrefix = countByCodePrefix(input.items)

  validateCounts(input.items, messages)
  validateDuplicateCodes(input.items, messages)
  validateAssetTypes(input.items, messages)
  validateBoundaries(elements, input.config, messages)

  if (input.config.rules.collisionEnabled) {
    validateCollisions(elements, messages)
  }

  messages.push({
    severity: 'info',
    title: 'Layout corrente',
    detail: `${input.items.length} elementi proiettati in sola lettura sul Canvas.`,
  })

  return {
    total: input.items.length,
    byCodePrefix,
    messages,
  }
}

function countByCodePrefix(items: BeachItem[]): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    const prefix = item.code.split('-')[0] ?? item.code
    counts[prefix] = (counts[prefix] ?? 0) + 1
    return counts
  }, {})
}

function validateCounts(items: BeachItem[], messages: MapCanvasValidationMessage[]): void {
  if (items.length !== 58) {
    messages.push({
      severity: 'warning',
      title: 'Conteggio elementi',
      detail: `Attesi 58 elementi, trovati ${items.length}.`,
    })
  }
}

function validateDuplicateCodes(items: BeachItem[], messages: MapCanvasValidationMessage[]): void {
  const codes = new Set<string>()
  const duplicates = new Set<string>()

  for (const item of items) {
    if (codes.has(item.code)) {
      duplicates.add(item.code)
    }
    codes.add(item.code)
  }

  if (duplicates.size > 0) {
    messages.push({
      severity: 'error',
      title: 'Codici duplicati',
      detail: [...duplicates].join(', '),
    })
  }
}

function validateAssetTypes(items: BeachItem[], messages: MapCanvasValidationMessage[]): void {
  const unknown = items.filter((item) => !knownAssetTypes.has(item.type))

  if (unknown.length > 0) {
    messages.push({
      severity: 'error',
      title: 'Asset non riconosciuti',
      detail: unknown.map((item) => item.code).join(', '),
    })
  }
}

function validateBoundaries(
  elements: CanvasMapElement[],
  config: MapCanvasConfig,
  messages: MapCanvasValidationMessage[],
): void {
  const outside = elements.filter(
    (element) =>
      getCanvasElementBoundaryIssues({
        element,
        widthM: config.beach.widthM,
        depthM: config.beach.depthM,
        marginFromBoundaryM: config.rules.marginFromBoundaryM,
      }).length > 0,
  )

  if (outside.length > 0) {
    messages.push({
      severity: 'warning',
      title: 'Elementi vicino o fuori area',
      detail: outside.map((element) => element.code).join(', '),
    })
  }
}

function validateCollisions(
  elements: CanvasMapElement[],
  messages: MapCanvasValidationMessage[],
): void {
  const collisions: string[] = []

  for (let index = 0; index < elements.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < elements.length; nextIndex += 1) {
      if (doCanvasElementsOverlap(elements[index], elements[nextIndex])) {
        collisions.push(`${elements[index].code}/${elements[nextIndex].code}`)
      }
    }
  }

  if (collisions.length > 0) {
    messages.push({
      severity: 'warning',
      title: 'Collisioni bounding-box',
      detail: collisions.slice(0, 8).join(', '),
    })
  }
}
