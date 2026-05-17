export const svgPointFromEvent = (event: PointerEvent) => {
  const element = event.currentTarget as SVGGraphicsElement
  const svg = element.ownerSVGElement
  const matrix = svg?.getScreenCTM()
  if (!svg || !matrix) return { x: 0, y: 0 }
  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY
  const transformed = point.matrixTransform(matrix.inverse())
  return { x: transformed.x, y: transformed.y }
}

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const roundMeters = (value: number) => Math.round(value * 100) / 100
