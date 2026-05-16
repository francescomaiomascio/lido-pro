import { worldToScreenPoint } from './metric'
import type { MapCanvasConfig } from './config'
import type { CanvasCamera } from './types'

export function renderCanvasZones(input: {
  context: CanvasRenderingContext2D
  config: MapCanvasConfig
  pixelsPerMeter: number
  camera: CanvasCamera
}): void {
  const { context, config, pixelsPerMeter, camera } = input

  if (!config.zones.visible) {
    return
  }

  const zones = [
    { label: 'Palme', yM: 2.2, heightM: 12.5, color: '#2f8f62' },
    { label: 'Ombrelloni', yM: 14.4, heightM: 9.1, color: '#d95b4a' },
    { label: 'Palmette', yM: 24, heightM: 2.8, color: '#758f38' },
  ]

  context.save()

  for (const zone of zones) {
    const topLeft = worldToScreenPoint({
      point: { xM: 0.7, yM: zone.yM },
      pixelsPerMeter,
      camera,
    })
    const bottomRight = worldToScreenPoint({
      point: { xM: config.beach.widthM - 0.7, yM: zone.yM + zone.heightM },
      pixelsPerMeter,
      camera,
    })
    const widthPx = bottomRight.xPx - topLeft.xPx
    const heightPx = bottomRight.yPx - topLeft.yPx

    context.globalAlpha = config.zones.opacity
    context.fillStyle = zone.color
    context.beginPath()
    context.roundRect(topLeft.xPx, topLeft.yPx, widthPx, heightPx, 18)
    context.fill()

    if (config.zones.showLabels) {
      context.globalAlpha = Math.min(0.9, config.zones.opacity + 0.42)
      context.fillStyle = '#183238'
      context.font = '800 12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      context.textAlign = 'left'
      context.textBaseline = 'top'
      context.fillText(zone.label, topLeft.xPx + 12, topLeft.yPx + 10)
    }
  }

  context.restore()
}
