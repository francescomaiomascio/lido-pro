import { drawAssetCodeLabel } from '../renderKit'
import { mapCanvasStyleTokens } from '../styleTokens'
import type { BeachCanvasAssetRenderInput } from './assetStyle'
import { drawAssetGroundShadow } from './assetStyle'

export function drawSmallPalmAsset(input: BeachCanvasAssetRenderInput): void {
  const { context, widthPx, heightPx } = input
  const radiusPx = Math.min(widthPx, heightPx) / 2

  if (input.shadowsEnabled) {
    drawAssetGroundShadow({
      context,
      widthPx,
      heightPx,
      fillStyle: mapCanvasStyleTokens.colors.assetShadow,
      offsetYPx: heightPx * 0.18,
    })
  }

  context.save()
  context.beginPath()
  context.moveTo(-widthPx * 0.07, -heightPx * 0.02)
  context.lineTo(widthPx * 0.07, -heightPx * 0.02)
  context.lineTo(widthPx * 0.1, heightPx * 0.22)
  context.lineTo(-widthPx * 0.1, heightPx * 0.22)
  context.closePath()
  context.fillStyle = mapCanvasStyleTokens.colors.smallPalmTrunk
  context.fill()

  const canopyGradient = context.createRadialGradient(
    -radiusPx * 0.18,
    -radiusPx * 0.18,
    radiusPx * 0.04,
    0,
    0,
    radiusPx,
  )
  canopyGradient.addColorStop(0, mapCanvasStyleTokens.colors.smallPalmCanopyHighlight)
  canopyGradient.addColorStop(0.6, mapCanvasStyleTokens.colors.smallPalmCanopy)
  canopyGradient.addColorStop(1, mapCanvasStyleTokens.colors.smallPalmCanopyDeep)

  for (const angle of [-1.4, -0.66, 0.08, 0.82, 1.56, 2.3]) {
    context.save()
    context.rotate(angle)
    context.beginPath()
    context.ellipse(radiusPx * 0.1, 0, radiusPx * 0.72, radiusPx * 0.28, 0, 0, Math.PI * 2)
    context.fillStyle = canopyGradient
    context.fill()
    context.strokeStyle = mapCanvasStyleTokens.colors.assetBorder
    context.lineWidth = 1
    context.stroke()
    context.restore()
  }

  context.beginPath()
  context.arc(0, 0, radiusPx * 0.4, 0, Math.PI * 2)
  context.fillStyle = canopyGradient
  context.fill()
  context.strokeStyle = mapCanvasStyleTokens.colors.assetBorder
  context.lineWidth = 1
  context.stroke()
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
