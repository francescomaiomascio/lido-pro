import { mapCanvasStyleTokens } from '../styleTokens'

export function fitTextToWidth(input: {
  context: CanvasRenderingContext2D
  text: string
  maxWidthPx: number
  fontSizePx: number
  fontWeight?: number
}): number {
  let fontSizePx = input.fontSizePx

  while (fontSizePx > 8) {
    input.context.font = `${input.fontWeight ?? 900} ${fontSizePx}px ${mapCanvasStyleTokens.font.family}`
    if (input.context.measureText(input.text).width <= input.maxWidthPx) {
      return fontSizePx
    }
    fontSizePx -= 1
  }

  return fontSizePx
}

export function getReadableFontSize(widthPx: number): number {
  return Math.max(
    mapCanvasStyleTokens.font.minAssetLabelPx,
    Math.min(mapCanvasStyleTokens.font.maxAssetLabelPx, widthPx * 0.25),
  )
}

export function drawHighContrastText(input: {
  context: CanvasRenderingContext2D
  text: string
  xPx: number
  yPx: number
  maxWidthPx: number
  fontSizePx: number
  align?: CanvasTextAlign
  baseline?: CanvasTextBaseline
}): void {
  const { context, text, xPx, yPx, maxWidthPx, align, baseline } = input
  const fontSizePx = fitTextToWidth({
    context,
    text,
    maxWidthPx,
    fontSizePx: input.fontSizePx,
    fontWeight: 900,
  })

  context.font = `900 ${fontSizePx}px ${mapCanvasStyleTokens.font.family}`
  context.textAlign = align ?? 'center'
  context.textBaseline = baseline ?? 'middle'
  context.lineWidth = 3
  context.strokeStyle = mapCanvasStyleTokens.colors.labelStroke
  context.strokeText(text, xPx, yPx, maxWidthPx)
  context.fillStyle = mapCanvasStyleTokens.colors.label
  context.fillText(text, xPx, yPx, maxWidthPx)
}
