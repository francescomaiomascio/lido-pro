import { drawCircle } from './primitives'
import { drawHighContrastText, getReadableFontSize } from './text'
import { mapCanvasStyleTokens } from '../styleTokens'

export function drawCenteredLabel(input: {
  context: CanvasRenderingContext2D
  text: string
  widthPx: number
  highContrast: boolean
}): void {
  const fontSizePx = getReadableFontSize(input.widthPx)

  if (input.highContrast) {
    drawHighContrastText({
      context: input.context,
      text: input.text,
      xPx: 0,
      yPx: 0,
      maxWidthPx: input.widthPx - 10,
      fontSizePx,
    })
    return
  }

  input.context.font = `900 ${fontSizePx}px ${mapCanvasStyleTokens.font.family}`
  input.context.textAlign = 'center'
  input.context.textBaseline = 'middle'
  input.context.fillStyle = mapCanvasStyleTokens.colors.label
  input.context.fillText(input.text, 0, 0, input.widthPx - 10)
}

export function drawAssetCodeLabel(input: {
  context: CanvasRenderingContext2D
  code: string
  widthPx: number
  highContrast: boolean
}): void {
  drawCenteredLabel({
    context: input.context,
    text: input.code,
    widthPx: input.widthPx,
    highContrast: input.highContrast,
  })
}

export function drawSmallBadge(input: {
  context: CanvasRenderingContext2D
  text: string
  xPx: number
  yPx: number
  fillStyle?: string
}): void {
  drawCircle({
    context: input.context,
    xPx: input.xPx,
    yPx: input.yPx,
    radiusPx: 6,
    fillStyle: input.fillStyle ?? '#ffffff',
    strokeStyle: mapCanvasStyleTokens.colors.selection,
    lineWidth: 1.5,
  })
  input.context.font = `800 7px ${mapCanvasStyleTokens.font.family}`
  input.context.textAlign = 'center'
  input.context.textBaseline = 'middle'
  input.context.fillStyle = mapCanvasStyleTokens.colors.selection
  input.context.fillText(input.text, input.xPx, input.yPx)
}
