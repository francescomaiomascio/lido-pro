import { mapCanvasStyleTokens } from '../styleTokens'

export function applySoftShadow(context: CanvasRenderingContext2D): void {
  context.shadowColor = mapCanvasStyleTokens.shadow.soft
  context.shadowBlur = 14
  context.shadowOffsetY = 5
}

export function clearShadow(context: CanvasRenderingContext2D): void {
  context.shadowColor = 'transparent'
  context.shadowBlur = 0
  context.shadowOffsetX = 0
  context.shadowOffsetY = 0
}

export function drawLiftedShadow(input: {
  context: CanvasRenderingContext2D
  xPx: number
  yPx: number
  widthPx: number
  heightPx: number
  radiusPx: number
}): void {
  input.context.save()
  input.context.shadowColor = mapCanvasStyleTokens.shadow.lifted
  input.context.shadowBlur = 18
  input.context.shadowOffsetY = 7
  input.context.fillStyle = 'rgb(0 0 0 / 0.01)'
  input.context.beginPath()
  input.context.roundRect(input.xPx, input.yPx, input.widthPx, input.heightPx, input.radiusPx)
  input.context.fill()
  input.context.restore()
}
