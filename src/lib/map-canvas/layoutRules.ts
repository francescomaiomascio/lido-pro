import type { CanvasMapElement } from './types'

export function doCanvasElementsOverlap(a: CanvasMapElement, b: CanvasMapElement): boolean {
  return (
    Math.abs(a.xM - b.xM) < (a.widthM + b.widthM) / 2 &&
    Math.abs(a.yM - b.yM) < (a.heightM + b.heightM) / 2
  )
}

export function getCanvasElementBoundaryIssues(input: {
  element: CanvasMapElement
  widthM: number
  depthM: number
  marginFromBoundaryM: number
}): string[] {
  const { element, widthM, depthM, marginFromBoundaryM } = input
  const issues: string[] = []
  const minXM = element.xM - element.widthM / 2
  const maxXM = element.xM + element.widthM / 2
  const minYM = element.yM - element.heightM / 2
  const maxYM = element.yM + element.heightM / 2

  if (minXM < marginFromBoundaryM || maxXM > widthM - marginFromBoundaryM) {
    issues.push('margine orizzontale')
  }

  if (minYM < marginFromBoundaryM || maxYM > depthM - marginFromBoundaryM) {
    issues.push('margine verticale')
  }

  return issues
}
