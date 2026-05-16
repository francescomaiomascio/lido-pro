import { worldToScreenPoint } from '../metric'
import type { CanvasCamera, MetricRect } from '../types'

export function drawRoundedRect(input: {
  context: CanvasRenderingContext2D
  xPx: number
  yPx: number
  widthPx: number
  heightPx: number
  radiusPx: number
  fillStyle?: string | CanvasGradient
  strokeStyle?: string
  lineWidth?: number
}): void {
  const { context, xPx, yPx, widthPx, heightPx, radiusPx, fillStyle, strokeStyle, lineWidth } = input

  context.beginPath()
  context.roundRect(xPx, yPx, widthPx, heightPx, radiusPx)
  if (fillStyle) {
    context.fillStyle = fillStyle
    context.fill()
  }
  if (strokeStyle) {
    context.strokeStyle = strokeStyle
    context.lineWidth = lineWidth ?? 1
    context.stroke()
  }
}

export function drawCircle(input: {
  context: CanvasRenderingContext2D
  xPx: number
  yPx: number
  radiusPx: number
  fillStyle?: string | CanvasGradient
  strokeStyle?: string
  lineWidth?: number
}): void {
  const { context, xPx, yPx, radiusPx, fillStyle, strokeStyle, lineWidth } = input

  context.beginPath()
  context.arc(xPx, yPx, radiusPx, 0, Math.PI * 2)
  if (fillStyle) {
    context.fillStyle = fillStyle
    context.fill()
  }
  if (strokeStyle) {
    context.strokeStyle = strokeStyle
    context.lineWidth = lineWidth ?? 1
    context.stroke()
  }
}

export function drawLine(input: {
  context: CanvasRenderingContext2D
  fromXPx: number
  fromYPx: number
  toXPx: number
  toYPx: number
  strokeStyle: string
  lineWidth?: number
}): void {
  input.context.beginPath()
  input.context.moveTo(input.fromXPx, input.fromYPx)
  input.context.lineTo(input.toXPx, input.toYPx)
  input.context.strokeStyle = input.strokeStyle
  input.context.lineWidth = input.lineWidth ?? 1
  input.context.stroke()
}

export function drawPath(input: {
  context: CanvasRenderingContext2D
  build: (context: CanvasRenderingContext2D) => void
  fillStyle?: string | CanvasGradient
  strokeStyle?: string
  lineWidth?: number
}): void {
  input.context.beginPath()
  input.build(input.context)
  if (input.fillStyle) {
    input.context.fillStyle = input.fillStyle
    input.context.fill()
  }
  if (input.strokeStyle) {
    input.context.strokeStyle = input.strokeStyle
    input.context.lineWidth = input.lineWidth ?? 1
    input.context.stroke()
  }
}

export function drawMetricRect(input: {
  context: CanvasRenderingContext2D
  rect: MetricRect
  pixelsPerMeter: number
  camera: CanvasCamera
  strokeStyle?: string
  fillStyle?: string | CanvasGradient
  lineWidth?: number
  radiusPx?: number
}): void {
  const topLeft = worldToScreenPoint({
    point: { xM: input.rect.xM, yM: input.rect.yM },
    pixelsPerMeter: input.pixelsPerMeter,
    camera: input.camera,
  })
  const bottomRight = worldToScreenPoint({
    point: {
      xM: input.rect.xM + input.rect.widthM,
      yM: input.rect.yM + input.rect.heightM,
    },
    pixelsPerMeter: input.pixelsPerMeter,
    camera: input.camera,
  })

  drawRoundedRect({
    context: input.context,
    xPx: topLeft.xPx,
    yPx: topLeft.yPx,
    widthPx: bottomRight.xPx - topLeft.xPx,
    heightPx: bottomRight.yPx - topLeft.yPx,
    radiusPx: input.radiusPx ?? 0,
    fillStyle: input.fillStyle,
    strokeStyle: input.strokeStyle,
    lineWidth: input.lineWidth,
  })
}
