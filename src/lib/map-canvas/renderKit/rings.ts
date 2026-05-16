import { mapCanvasStyleTokens } from '../styleTokens'
import { drawRoundedRect } from './primitives'

export function drawSelectionRing(input: {
  context: CanvasRenderingContext2D
  widthPx: number
  heightPx: number
  editMode: boolean
}): void {
  const radiusPx = Math.min(input.widthPx, input.heightPx) / 2

  input.context.save()
  input.context.setLineDash(input.editMode ? [4, 4] : [])
  drawRoundedRect({
    context: input.context,
    xPx: -input.widthPx / 2,
    yPx: -input.heightPx / 2,
    widthPx: input.widthPx,
    heightPx: input.heightPx,
    radiusPx,
    strokeStyle: input.editMode ? mapCanvasStyleTokens.colors.editSelection : mapCanvasStyleTokens.colors.selection,
    lineWidth: 2.6,
  })
  input.context.restore()
}

export function drawHoverRing(input: {
  context: CanvasRenderingContext2D
  widthPx: number
  heightPx: number
}): void {
  drawRing(input.context, input.widthPx, input.heightPx, 'rgb(255 255 255 / 0.72)', 2)
}

export function drawWarningRing(input: {
  context: CanvasRenderingContext2D
  widthPx: number
  heightPx: number
}): void {
  drawRing(input.context, input.widthPx, input.heightPx, mapCanvasStyleTokens.colors.warning, 2)
}

export function drawErrorRing(input: {
  context: CanvasRenderingContext2D
  widthPx: number
  heightPx: number
}): void {
  drawRing(input.context, input.widthPx, input.heightPx, mapCanvasStyleTokens.colors.error, 2.4)
}

function drawRing(
  context: CanvasRenderingContext2D,
  widthPx: number,
  heightPx: number,
  strokeStyle: string,
  lineWidth: number,
): void {
  drawRoundedRect({
    context,
    xPx: -widthPx / 2,
    yPx: -heightPx / 2,
    widthPx,
    heightPx,
    radiusPx: Math.min(widthPx, heightPx) / 2,
    strokeStyle,
    lineWidth,
  })
}
