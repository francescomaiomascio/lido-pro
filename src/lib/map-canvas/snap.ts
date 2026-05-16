import type { MetricPoint } from './types'

export function snapMetricValue(valueM: number, snapStepM: number): number {
  if (!isSnapStepValid(snapStepM)) {
    return valueM
  }

  return Math.round(valueM / snapStepM) * snapStepM
}

export function snapMetricPoint(point: MetricPoint, snapStepM: number): MetricPoint {
  return {
    xM: snapMetricValue(point.xM, snapStepM),
    yM: snapMetricValue(point.yM, snapStepM),
  }
}

export function isSnapStepValid(snapStepM: number): boolean {
  return Number.isFinite(snapStepM) && snapStepM > 0
}
