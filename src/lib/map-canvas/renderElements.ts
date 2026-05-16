import { worldToScreenPoint } from './metric'
import type { MapCanvasConfig } from './config'
import type { CanvasCamera, CanvasMapElement } from './types'
import { mapCanvasStyleTokens } from './styleTokens'
import { getBeachCanvasAssetDefinition } from './assets/assetDefinitions'
import { drawBeachCanvasAsset } from './assets/assetRenderers'
import { getAssetScreenSizePx } from './assets/assetStyle'

export function renderCanvasElements(input: {
  context: CanvasRenderingContext2D
  elements: CanvasMapElement[]
  dimmedElementIds: Set<string>
  selectedElementId: string | null
  config: MapCanvasConfig
  pixelsPerMeter: number
  camera: CanvasCamera
}): void {
  const orderedElements = input.elements.toSorted((a, b) => a.zIndex - b.zIndex)

  if (input.config.assets.labelMode === 'always' && input.config.assets.rowLabelMode === 'side_badge') {
    renderCanvasRowLabels(input)
  }

  for (const element of orderedElements) {
    renderCanvasElement({ ...input, element })
  }
}

function renderCanvasElement(input: {
  context: CanvasRenderingContext2D
  element: CanvasMapElement
  dimmedElementIds: Set<string>
  selectedElementId: string | null
  config: MapCanvasConfig
  pixelsPerMeter: number
  camera: CanvasCamera
}): void {
  const { context, element, pixelsPerMeter, camera, config } = input
  const center = worldToScreenPoint({
    point: { xM: element.xM, yM: element.yM },
    pixelsPerMeter,
    camera,
  })
  const definition = getBeachCanvasAssetDefinition(element.assetType)

  if (!definition) {
    return
  }

  const { widthPx, heightPx } = getAssetScreenSizePx({
    element,
    definition,
    config,
    pixelsPerMeter,
    camera,
  })
  const dimmed = input.dimmedElementIds.has(element.id)
  const showLabel =
    config.assets.labelMode === 'always' ||
    (config.assets.labelMode === 'selected' && input.selectedElementId === element.id)

  context.save()
  context.globalAlpha = dimmed ? mapCanvasStyleTokens.opacity.dimmedAsset : 1
  context.translate(center.xPx, center.yPx)
  context.rotate((element.rotationDeg * Math.PI) / 180)
  drawBeachCanvasAsset({
    context,
    element,
    definition,
    widthPx,
    heightPx,
    showLabel,
    shadowsEnabled: config.assets.shadowsEnabled,
    highContrastLabel: config.assets.highContrastLabels,
    codeDisplayMode: config.assets.codeDisplayMode,
    rowLabelMode: config.assets.rowLabelMode,
  })

  context.restore()
}


function renderCanvasRowLabels(input: {
  context: CanvasRenderingContext2D
  elements: CanvasMapElement[]
  config: MapCanvasConfig
  pixelsPerMeter: number
  camera: CanvasCamera
}): void {
  const rows = new Map<string, CanvasMapElement[]>()

  for (const element of input.elements) {
    const row = rows.get(element.rowLabel) ?? []
    row.push(element)
    rows.set(element.rowLabel, row)
  }

  input.context.save()
  input.context.font = `480 13px ${mapCanvasStyleTokens.font.family}`
  input.context.textAlign = 'right'
  input.context.textBaseline = 'middle'
  input.context.fillStyle = 'rgb(91 101 98 / 0.42)'

  const drawRowLabel = (rowElements: CanvasMapElement[], label: string) => {
    if (!rowElements.length) return

    const yM = rowElements.reduce((sum, element) => sum + element.yM, 0) / rowElements.length
    const labelPoint = worldToScreenPoint({
      point: {
        xM: -0.22,
        yM,
      },
      pixelsPerMeter: input.pixelsPerMeter,
      camera: input.camera,
    })

    input.context.fillText(label, labelPoint.xPx, labelPoint.yPx)
  }

  if (input.config.assets.rowLabelNumberingMode === 'by_family') {
    const groupedRows = new Map<string, Array<[string, CanvasMapElement[]]>>()

    for (const entry of rows.entries()) {
      const family = getRowFamily(entry[1][0])
      const familyRows = groupedRows.get(family) ?? []
      familyRows.push(entry)
      groupedRows.set(family, familyRows)
    }

    for (const familyRows of groupedRows.values()) {
      getRowsTopToBottom(familyRows).forEach(([rowLabel, rowElements], index) => {
        drawRowLabel(rowElements, getConfiguredRowLabel(input.config, rowLabel, index))
      })
    }

    input.context.restore()
    return
  }

  getRowsTopToBottom([...rows.entries()]).forEach(([rowLabel, rowElements], index) => {
    drawRowLabel(rowElements, getConfiguredRowLabel(input.config, rowLabel, index))
  })

  input.context.restore()
}

function getRowsTopToBottom(rows: Array<[string, CanvasMapElement[]]>): Array<[string, CanvasMapElement[]]> {
  return rows.toSorted(([, a], [, b]) => {
    const ay = a.reduce((sum, element) => sum + element.yM, 0) / a.length
    const by = b.reduce((sum, element) => sum + element.yM, 0) / b.length
    return ay - by
  })
}

function getConfiguredRowLabel(config: MapCanvasConfig, rowLabel: string, index: number): string {
  const override = config.assets.rowLabelOverrides[rowLabel]?.trim()
  return override || String(index + 1)
}

function getRowFamily(element: CanvasMapElement | undefined): string {
  if (!element) return 'unknown'

  if (element.assetType === 'umbrella') return 'umbrella'
  if (element.assetType === 'small_palm') return 'small_palm'
  return 'palm'
}
