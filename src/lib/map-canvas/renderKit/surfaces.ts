import { mapCanvasStyleTokens } from '../styleTokens'
import { getMapBackgroundPalette, type MapBackgroundPalette } from '../visualPresets'
import type { MapCanvasConfig } from '../config'

export function drawGradientSurface(input: {
  context: CanvasRenderingContext2D
  xPx: number
  yPx: number
  widthPx: number
  heightPx: number
  config: MapCanvasConfig
}): void {
  const palette = getMapBackgroundPalette(input.config.background.preset)
  const gradient = createSeaSideGradient({
    context: input.context,
    xPx: input.xPx,
    yPx: input.yPx,
    widthPx: input.widthPx,
    heightPx: input.heightPx,
    seaSide: input.config.beach.seaSide,
  })

  if (input.config.background.seaGradientEnabled) {
    gradient.addColorStop(0, palette.waterDepth)
    gradient.addColorStop(0.07, palette.waterTop)
    gradient.addColorStop(0.13, palette.waterEdge)
    gradient.addColorStop(0.18, palette.shoreFoam)
    gradient.addColorStop(0.25, palette.sandTop)
    gradient.addColorStop(0.66, palette.sandMiddle)
    gradient.addColorStop(1, palette.sandBottom)
  } else {
    gradient.addColorStop(0, palette.sandTop)
    gradient.addColorStop(0.56, palette.sandMiddle)
    gradient.addColorStop(1, palette.sandBottom)
  }

  input.context.fillStyle = gradient
  input.context.fillRect(input.xPx, input.yPx, input.widthPx, input.heightPx)

  drawSurfaceWash({
    context: input.context,
    xPx: input.xPx,
    yPx: input.yPx,
    widthPx: input.widthPx,
    heightPx: input.heightPx,
    palette,
  })
}

export function drawNoiseTexture(input: {
  context: CanvasRenderingContext2D
  xPx: number
  yPx: number
  widthPx: number
  heightPx: number
  intensity: number
  config?: MapCanvasConfig
}): void {
  const palette = input.config ? getMapBackgroundPalette(input.config.background.preset) : null
  const textureWeight = palette?.textureIntensity ?? 1
  const intensity = Math.min(1, Math.max(0, input.intensity * textureWeight))
  const sandSpacingPx = 20
  const waterSpacingPx = 28

  input.context.save()
  input.context.globalAlpha = intensity

  const seaBand = getSeaBand({
    xPx: input.xPx,
    yPx: input.yPx,
    widthPx: input.widthPx,
    heightPx: input.heightPx,
    seaSide: input.config?.beach.seaSide ?? 'top',
  })

  if (input.config?.background.seaGradientEnabled !== false) {
    const seaSide = input.config?.beach.seaSide ?? 'top'
    input.context.strokeStyle = palette?.textureWater ?? 'rgb(255 255 255 / 0.14)'
    input.context.lineWidth = 0.8

    if (seaSide === 'left' || seaSide === 'right') {
      for (let x = seaBand.xPx + 10; x < seaBand.xPx + seaBand.widthPx; x += waterSpacingPx) {
        const offsetPx = (Math.floor(x) % 37) * 0.5
        input.context.beginPath()
        input.context.moveTo(x, seaBand.yPx + offsetPx)
        input.context.bezierCurveTo(
          x + 2.2,
          seaBand.yPx + seaBand.heightPx * 0.24,
          x - 2.4,
          seaBand.yPx + seaBand.heightPx * 0.62,
          x + 1.4,
          seaBand.yPx + seaBand.heightPx - offsetPx * 0.5,
        )
        input.context.stroke()
      }
    } else {
      for (let y = seaBand.yPx + 10; y < seaBand.yPx + seaBand.heightPx; y += waterSpacingPx) {
        const offsetPx = (Math.floor(y) % 37) * 0.5
        input.context.beginPath()
        input.context.moveTo(seaBand.xPx + offsetPx, y)
        input.context.bezierCurveTo(
          seaBand.xPx + seaBand.widthPx * 0.24,
          y + 2.2,
          seaBand.xPx + seaBand.widthPx * 0.62,
          y - 2.4,
          seaBand.xPx + seaBand.widthPx - offsetPx * 0.5,
          y + 1.4,
        )
        input.context.stroke()
      }
    }
  }

  for (let y = input.yPx + 16; y < input.yPx + input.heightPx; y += sandSpacingPx) {
    for (let x = input.xPx + ((Math.floor(y) % 29) / 29) * sandSpacingPx; x < input.xPx + input.widthPx; x += sandSpacingPx) {
      const seed = pseudoRandom(x, y)
      const radiusPx = 0.45 + seed * 0.65
      input.context.fillStyle = seed > 0.48
        ? (palette?.textureLight ?? 'rgb(255 255 255 / 0.12)')
        : (palette?.textureDark ?? 'rgb(95 75 42 / 0.1)')
      input.context.beginPath()
      input.context.arc(x + seed * 4, y + pseudoRandom(y, x) * 4, radiusPx, 0, Math.PI * 2)
      input.context.fill()
    }
  }

  input.context.restore()
}

export function drawBeachBoundary(input: {
  context: CanvasRenderingContext2D
  xPx: number
  yPx: number
  widthPx: number
  heightPx: number
  editMode: boolean
  strokeStyle?: string
}): void {
  input.context.strokeStyle = input.strokeStyle ?? mapCanvasStyleTokens.colors.boundary
  input.context.lineWidth = input.editMode ? 2 : 1.2
  input.context.strokeRect(input.xPx + 0.5, input.yPx + 0.5, input.widthPx - 1, input.heightPx - 1)
}

export function drawBeachBoundaryGuide(input: {
  context: CanvasRenderingContext2D
  xPx: number
  yPx: number
  widthPx: number
  heightPx: number
  editMode: boolean
  config?: MapCanvasConfig
}): void {
  const palette = input.config ? getMapBackgroundPalette(input.config.background.preset) : null
  input.context.save()
  input.context.setLineDash(input.editMode ? [9, 7] : [])
  input.context.strokeStyle = input.editMode
    ? (palette?.boundaryEdit ?? 'rgb(20 57 63 / 0.46)')
    : (palette?.boundaryWork ?? 'rgb(20 57 63 / 0.08)')
  input.context.lineWidth = input.editMode ? 1.15 : 0.6
  input.context.strokeRect(input.xPx + 0.5, input.yPx + 0.5, input.widthPx - 1, input.heightPx - 1)

  if (input.editMode) {
    input.context.setLineDash([])
    input.context.strokeStyle = 'rgb(255 255 255 / 0.18)'
    input.context.lineWidth = 0.6
    input.context.strokeRect(input.xPx + 3.5, input.yPx + 3.5, input.widthPx - 7, input.heightPx - 7)
  }

  input.context.restore()
}

export function drawSubtleVignette(input: {
  context: CanvasRenderingContext2D
  xPx: number
  yPx: number
  widthPx: number
  heightPx: number
  config: MapCanvasConfig
}): void {
  const palette = getMapBackgroundPalette(input.config.background.preset)
  const gradient = input.context.createRadialGradient(
    input.xPx + input.widthPx * 0.42,
    input.yPx + input.heightPx * 0.42,
    Math.min(input.widthPx, input.heightPx) * 0.18,
    input.xPx + input.widthPx * 0.5,
    input.yPx + input.heightPx * 0.5,
    Math.max(input.widthPx, input.heightPx) * 0.72,
  )

  gradient.addColorStop(0, palette.highlight)
  gradient.addColorStop(0.66, 'rgb(255 255 255 / 0)')
  gradient.addColorStop(1, palette.vignette)
  input.context.fillStyle = gradient
  input.context.fillRect(input.xPx, input.yPx, input.widthPx, input.heightPx)
}

export function drawSubtleSurfaceDepth(input: {
  context: CanvasRenderingContext2D
  xPx: number
  yPx: number
  widthPx: number
  heightPx: number
  config: MapCanvasConfig
}): void {
  const palette = getMapBackgroundPalette(input.config.background.preset)
  const editMode = input.config.interaction.mode === 'edit'

  input.context.save()
  input.context.strokeStyle = editMode ? palette.boundaryEdit : palette.boundaryWork
  input.context.lineWidth = editMode ? 1 : 0.6
  input.context.globalAlpha = editMode ? 0.5 : 0.34
  input.context.strokeRect(input.xPx + 0.5, input.yPx + 0.5, input.widthPx - 1, input.heightPx - 1)
  input.context.restore()
}

function createSeaSideGradient(input: {
  context: CanvasRenderingContext2D
  xPx: number
  yPx: number
  widthPx: number
  heightPx: number
  seaSide: MapCanvasConfig['beach']['seaSide']
}): CanvasGradient {
  if (input.seaSide === 'bottom') {
    return input.context.createLinearGradient(input.xPx, input.yPx + input.heightPx, input.xPx, input.yPx)
  }

  if (input.seaSide === 'left') {
    return input.context.createLinearGradient(input.xPx, input.yPx, input.xPx + input.widthPx, input.yPx)
  }

  if (input.seaSide === 'right') {
    return input.context.createLinearGradient(input.xPx + input.widthPx, input.yPx, input.xPx, input.yPx)
  }

  return input.context.createLinearGradient(input.xPx, input.yPx, input.xPx, input.yPx + input.heightPx)
}

function drawSurfaceWash(input: {
  context: CanvasRenderingContext2D
  xPx: number
  yPx: number
  widthPx: number
  heightPx: number
  palette: MapBackgroundPalette
}): void {
  const glow = input.context.createRadialGradient(
    input.xPx + input.widthPx * 0.46,
    input.yPx + input.heightPx * 0.4,
    Math.min(input.widthPx, input.heightPx) * 0.08,
    input.xPx + input.widthPx * 0.46,
    input.yPx + input.heightPx * 0.46,
    Math.max(input.widthPx, input.heightPx) * 0.74,
  )

  glow.addColorStop(0, input.palette.surfaceWash)
  glow.addColorStop(0.64, 'rgb(255 255 255 / 0)')
  glow.addColorStop(1, input.palette.shade)

  input.context.fillStyle = glow
  input.context.fillRect(input.xPx, input.yPx, input.widthPx, input.heightPx)
}

function getSeaBand(input: {
  xPx: number
  yPx: number
  widthPx: number
  heightPx: number
  seaSide: MapCanvasConfig['beach']['seaSide']
}): { xPx: number; yPx: number; widthPx: number; heightPx: number } {
  const bandDepthPx = Math.max(48, Math.min(input.widthPx, input.heightPx) * 0.2)

  if (input.seaSide === 'bottom') {
    return {
      xPx: input.xPx,
      yPx: input.yPx + input.heightPx - bandDepthPx,
      widthPx: input.widthPx,
      heightPx: bandDepthPx,
    }
  }

  if (input.seaSide === 'left') {
    return {
      xPx: input.xPx,
      yPx: input.yPx,
      widthPx: bandDepthPx,
      heightPx: input.heightPx,
    }
  }

  if (input.seaSide === 'right') {
    return {
      xPx: input.xPx + input.widthPx - bandDepthPx,
      yPx: input.yPx,
      widthPx: bandDepthPx,
      heightPx: input.heightPx,
    }
  }

  return {
    xPx: input.xPx,
    yPx: input.yPx,
    widthPx: input.widthPx,
    heightPx: bandDepthPx,
  }
}

function pseudoRandom(x: number, y: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453

  return value - Math.floor(value)
}
