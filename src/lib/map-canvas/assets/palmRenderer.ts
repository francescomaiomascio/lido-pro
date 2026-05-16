import { drawAssetCodeLabel } from '../renderKit'
import { mapCanvasStyleTokens } from '../styleTokens'
import type { BeachCanvasAssetRenderInput } from './assetStyle'
import { drawAssetGroundShadow } from './assetStyle'

export function drawPalmAsset(input: BeachCanvasAssetRenderInput): void {
  const { context, widthPx, heightPx } = input
  const radiusPx = Math.min(widthPx, heightPx) / 2

  if (input.shadowsEnabled) {
    drawAssetGroundShadow({
      context,
      widthPx,
      heightPx,
      fillStyle: mapCanvasStyleTokens.colors.assetShadow,
    })
  }

  context.save()
  drawPalmTrunk(context, widthPx, heightPx)
  drawPalmCanopy(context, radiusPx)
  context.restore()

  if (input.showLabel) {
    drawAssetCodeLabel({
      context,
      code: input.element.code,
      widthPx,
      highContrast: input.highContrastLabel,
    })
  }
}

function drawPalmTrunk(context: CanvasRenderingContext2D, widthPx: number, heightPx: number): void {
  const trunkGradient = context.createLinearGradient(0, -heightPx * 0.04, 0, heightPx * 0.32)
  trunkGradient.addColorStop(0, mapCanvasStyleTokens.colors.palmTrunkLight)
  trunkGradient.addColorStop(1, mapCanvasStyleTokens.colors.palmTrunkDeep)

  context.fillStyle = trunkGradient
  context.beginPath()
  context.moveTo(-widthPx * 0.08, -heightPx * 0.02)
  context.lineTo(widthPx * 0.08, -heightPx * 0.02)
  context.lineTo(widthPx * 0.13, heightPx * 0.3)
  context.lineTo(-widthPx * 0.13, heightPx * 0.3)
  context.closePath()
  context.fill()
}

function drawPalmCanopy(context: CanvasRenderingContext2D, radiusPx: number): void {
  const canopyGradient = context.createRadialGradient(
    -radiusPx * 0.18,
    -radiusPx * 0.24,
    radiusPx * 0.08,
    0,
    0,
    radiusPx,
  )
  canopyGradient.addColorStop(0, mapCanvasStyleTokens.colors.palmCanopyHighlight)
  canopyGradient.addColorStop(0.58, mapCanvasStyleTokens.colors.palmCanopy)
  canopyGradient.addColorStop(1, mapCanvasStyleTokens.colors.palmCanopyDeep)

  context.save()
  for (const angle of [-1.42, -0.88, -0.34, 0.2, 0.74, 1.28, 1.82, 2.36]) {
    context.save()
    context.rotate(angle)
    context.beginPath()
    context.ellipse(radiusPx * 0.12, 0, radiusPx * 0.82, radiusPx * 0.34, 0, 0, Math.PI * 2)
    context.fillStyle = canopyGradient
    context.fill()
    context.strokeStyle = mapCanvasStyleTokens.colors.assetBorder
    context.lineWidth = 1.1
    context.stroke()
    context.restore()
  }

  context.beginPath()
  context.arc(0, 0, radiusPx * 0.46, 0, Math.PI * 2)
  context.fillStyle = canopyGradient
  context.fill()
  context.strokeStyle = mapCanvasStyleTokens.colors.assetBorder
  context.lineWidth = 1.1
  context.stroke()

  context.beginPath()
  context.arc(-radiusPx * 0.16, -radiusPx * 0.2, radiusPx * 0.42, Math.PI * 1.02, Math.PI * 1.78)
  context.strokeStyle = mapCanvasStyleTokens.colors.assetHighlight
  context.lineWidth = 1.2
  context.stroke()
  context.restore()
}
