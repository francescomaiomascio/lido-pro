import { drawAssetCodeLabel } from '../renderKit'
import { mapCanvasStyleTokens } from '../styleTokens'
import type { BeachCanvasAssetRenderInput } from './assetStyle'
import { drawAssetGroundShadow } from './assetStyle'

export function drawUmbrellaAsset(input: BeachCanvasAssetRenderInput): void {
  const { context, widthPx, heightPx } = input
  const radiusPx = Math.min(widthPx, heightPx) / 2

  if (input.shadowsEnabled) {
    drawAssetGroundShadow({
      context,
      widthPx,
      heightPx,
      fillStyle: mapCanvasStyleTokens.colors.assetShadow,
      offsetYPx: heightPx * 0.2,
    })
  }

  const canopyGradient = context.createRadialGradient(
    -radiusPx * 0.22,
    -radiusPx * 0.26,
    radiusPx * 0.08,
    0,
    0,
    radiusPx,
  )
  canopyGradient.addColorStop(0, mapCanvasStyleTokens.colors.umbrellaCanopyHighlight)
  canopyGradient.addColorStop(0.58, mapCanvasStyleTokens.colors.umbrellaCanopy)
  canopyGradient.addColorStop(1, mapCanvasStyleTokens.colors.umbrellaCanopyDeep)

  context.save()
  context.beginPath()
  context.arc(0, 0, radiusPx, 0, Math.PI * 2)
  context.fillStyle = canopyGradient
  context.fill()
  context.strokeStyle = mapCanvasStyleTokens.colors.assetBorder
  context.lineWidth = 1.45
  context.stroke()

  context.strokeStyle = mapCanvasStyleTokens.colors.umbrellaSegment
  context.lineWidth = 0.95
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8
    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(Math.cos(angle) * radiusPx * 0.88, Math.sin(angle) * radiusPx * 0.88)
    context.stroke()
  }

  context.beginPath()
  context.arc(-radiusPx * 0.16, -radiusPx * 0.18, radiusPx * 0.58, Math.PI * 1.03, Math.PI * 1.78)
  context.strokeStyle = mapCanvasStyleTokens.colors.assetHighlight
  context.lineWidth = 1.25
  context.stroke()

  context.beginPath()
  context.arc(0, 0, Math.max(2.2, radiusPx * 0.12), 0, Math.PI * 2)
  context.fillStyle = mapCanvasStyleTokens.colors.umbrellaPole
  context.fill()
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
