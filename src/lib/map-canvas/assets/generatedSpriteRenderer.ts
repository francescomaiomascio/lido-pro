import { mapCanvasStyleTokens } from '../styleTokens'
import type { BeachCanvasAssetRenderInput } from './assetStyle'
import { getDefaultGeneratedSpriteId } from './defaultAssetVariants'
import {
  getGeneratedAssetRenderProfile,
  getProfiledGeneratedAssetSize,
  type AssetLabelAnchor,
  type GeneratedAssetRenderProfile,
} from './generatedAssetRenderProfiles'
import { getGeneratedCanvasSprite } from './generatedSpriteLoader'

export function drawGeneratedSpriteAsset(input: BeachCanvasAssetRenderInput): boolean {
  const spriteId = getDefaultGeneratedSpriteId(input.element.assetType)

  if (!spriteId) {
    return false
  }

  const image = getGeneratedCanvasSprite(spriteId)

  if (!image) {
    return false
  }

  const profile = getGeneratedAssetRenderProfile(spriteId)
  const size = getProfiledGeneratedAssetSize({
    widthPx: input.widthPx,
    heightPx: input.heightPx,
    profile,
  })

  if (input.shadowsEnabled) {
    drawProfiledSpriteShadow({
      context: input.context,
      widthPx: size.widthPx,
      heightPx: size.heightPx,
      profile,
    })
  }

  const drawWidthPx = Math.max(1, size.widthPx - profile.spritePaddingPx * 2)
  const drawHeightPx = Math.max(1, size.heightPx - profile.spritePaddingPx * 2)

  input.context.drawImage(
    image,
    -drawWidthPx / 2,
    -drawHeightPx / 2,
    drawWidthPx,
    drawHeightPx,
  )

  if (input.showLabel) {
    drawProfiledSpriteLabel({
      context: input.context,
      label: getElementLabelParts(input),
      widthPx: size.widthPx,
      heightPx: size.heightPx,
      profile,
      highContrast: input.highContrastLabel,
    })
  }

  return true
}

export function getGeneratedSpriteProfileForAssetType(assetType: BeachCanvasAssetRenderInput['element']['assetType']): {
  spriteId: string | null
  profile: GeneratedAssetRenderProfile
} {
  const spriteId = getDefaultGeneratedSpriteId(assetType)
  return {
    spriteId,
    profile: getGeneratedAssetRenderProfile(spriteId),
  }
}

function drawProfiledSpriteShadow(input: {
  context: CanvasRenderingContext2D
  widthPx: number
  heightPx: number
  profile: GeneratedAssetRenderProfile
}): void {
  const alpha = Math.max(0, Math.min(0.32, input.profile.shadowAlpha))
  input.context.save()
  input.context.globalAlpha *= alpha / 0.18
  input.context.fillStyle = mapCanvasStyleTokens.colors.assetShadow
  input.context.beginPath()
  input.context.ellipse(
    0,
    input.heightPx * 0.22,
    input.widthPx * 0.34 * input.profile.shadowScale,
    input.heightPx * 0.16 * input.profile.shadowScale,
    0,
    0,
    Math.PI * 2,
  )
  input.context.fill()
  input.context.restore()
}

function drawProfiledSpriteLabel(input: {
  context: CanvasRenderingContext2D
  label: { main: string; row: string | null }
  widthPx: number
  heightPx: number
  profile: GeneratedAssetRenderProfile
  highContrast: boolean
}): void {
  const { xPx, yPx } = getLabelPoint({
    widthPx: input.widthPx,
    heightPx: input.heightPx,
    anchor: input.profile.labelAnchor,
    offsetPx: input.profile.labelOffsetPx,
  })
  const maxWidthPx = Math.max(22, input.widthPx * input.profile.labelMaxWidthRatio)
  const fontSizePx = Math.max(
    11,
    Math.min(15, input.widthPx * 0.19 * input.profile.labelFontScale),
  )
  const rowFontSizePx = Math.max(7, fontSizePx * 0.72)

  input.context.save()
  input.context.textAlign = 'center'
  input.context.textBaseline = 'middle'
  input.context.lineJoin = 'round'

  if (input.label.row) {
    input.context.font = `760 ${rowFontSizePx}px ${mapCanvasStyleTokens.font.family}`
    const rowWidth = input.context.measureText(input.label.row).width
    input.context.font = `520 ${fontSizePx}px ${mapCanvasStyleTokens.font.family}`
    const mainWidth = input.context.measureText(input.label.main).width
    const totalWidth = Math.min(maxWidthPx, rowWidth + mainWidth + 5)
    const startXPx = xPx - totalWidth / 2
    const rowXPx = startXPx + rowWidth / 2
    const mainXPx = startXPx + rowWidth + 5 + mainWidth / 2

    input.context.font = `760 ${rowFontSizePx}px ${mapCanvasStyleTokens.font.family}`
    input.context.fillStyle = 'rgb(93 106 103 / 0.62)'
    input.context.fillText(input.label.row, rowXPx, yPx, rowWidth + 2)

    input.context.font = `520 ${fontSizePx}px ${mapCanvasStyleTokens.font.family}`
    input.context.fillStyle = 'rgb(58 72 72 / 0.82)'
    input.context.fillText(input.label.main, mainXPx, yPx, mainWidth + 4)
    input.context.restore()
    return
  }

  input.context.font = `520 ${fontSizePx}px ${mapCanvasStyleTokens.font.family}`
  input.context.fillStyle = 'rgb(58 72 72 / 0.82)'
  input.context.fillText(input.label.main, xPx, yPx, maxWidthPx)
  input.context.restore()
}

function getElementLabelParts(input: BeachCanvasAssetRenderInput): { main: string; row: string | null } {
  if (input.codeDisplayMode === 'stored_code') {
    return { main: input.element.code, row: null }
  }

  const main = String(input.element.sequentialNumber)

  if (input.rowLabelMode === 'side_badge') {
    return { main, row: null }
  }

  if (input.rowLabelMode === 'inline') {
    return { main: `${input.element.rowLabel} ${main}`, row: null }
  }

  return { main, row: null }
}

function getLabelPoint(input: {
  widthPx: number
  heightPx: number
  anchor: AssetLabelAnchor
  offsetPx: number
}): { xPx: number; yPx: number } {
  if (input.anchor === 'above') {
    return { xPx: 0, yPx: -input.heightPx / 2 - input.offsetPx }
  }

  if (input.anchor === 'below') {
    return { xPx: 0, yPx: input.heightPx / 2 + input.offsetPx }
  }

  if (input.anchor === 'top') {
    return { xPx: 0, yPx: -input.heightPx * 0.26 + input.offsetPx }
  }

  if (input.anchor === 'bottom') {
    return { xPx: 0, yPx: input.heightPx * 0.26 + input.offsetPx }
  }

  return { xPx: 0, yPx: input.offsetPx }
}
