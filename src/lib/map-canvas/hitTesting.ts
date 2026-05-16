import type { CanvasMapElement, MetricPoint } from './types'
import { getBeachCanvasAssetDefinition } from './assets/assetDefinitions'

export function hitTestCanvasElements(input: {
  pointM: MetricPoint
  elements: CanvasMapElement[]
}): CanvasMapElement | null {
  const orderedElements = input.elements
    .filter((element) => element.active)
    .toSorted((a, b) => b.zIndex - a.zIndex)

  return orderedElements.find((element) => isPointInsideElement(input.pointM, element)) ?? null
}

function isPointInsideElement(point: MetricPoint, element: CanvasMapElement): boolean {
  const definition = getBeachCanvasAssetDefinition(element.assetType)
  const minTouchHitM = 0.42
  const halfWidthM = Math.max(element.widthM / 2, minTouchHitM / 2)
  const halfHeightM = Math.max(element.heightM / 2, minTouchHitM / 2)

  if (definition?.collisionShape === 'circle') {
    const normalizedXPx = (point.xM - element.xM) / halfWidthM
    const normalizedYPx = (point.yM - element.yM) / halfHeightM
    return normalizedXPx * normalizedXPx + normalizedYPx * normalizedYPx <= 1
  }

  return (
    point.xM >= element.xM - halfWidthM &&
    point.xM <= element.xM + halfWidthM &&
    point.yM >= element.yM - halfHeightM &&
    point.yM <= element.yM + halfHeightM
  )
}
