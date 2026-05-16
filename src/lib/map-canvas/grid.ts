import type { CanvasGridLine } from './types'

export function createCanvasGridLines(input: {
  widthM: number
  depthM: number
  stepM: number
  majorEveryM?: number
}): CanvasGridLine[] {
  if (input.stepM <= 0 || input.widthM < 0 || input.depthM < 0) {
    return []
  }

  const lines: CanvasGridLine[] = []
  const majorEveryM = input.majorEveryM ?? 1

  for (let xM = 0; xM <= input.widthM; xM += input.stepM) {
    const normalizedXM = normalizeMetricValue(xM, input.widthM)
    lines.push({
      from: { xM: normalizedXM, yM: 0 },
      to: { xM: normalizedXM, yM: input.depthM },
      major: isMajorLine(normalizedXM, majorEveryM),
    })
  }

  for (let yM = 0; yM <= input.depthM; yM += input.stepM) {
    const normalizedYM = normalizeMetricValue(yM, input.depthM)
    lines.push({
      from: { xM: 0, yM: normalizedYM },
      to: { xM: input.widthM, yM: normalizedYM },
      major: isMajorLine(normalizedYM, majorEveryM),
    })
  }

  return lines
}

function normalizeMetricValue(valueM: number, maxM: number): number {
  return Math.min(maxM, Number(valueM.toFixed(6)))
}

function isMajorLine(valueM: number, majorEveryM: number): boolean {
  if (majorEveryM <= 0) {
    return false
  }

  return Math.abs(valueM / majorEveryM - Math.round(valueM / majorEveryM)) < 0.000001
}
