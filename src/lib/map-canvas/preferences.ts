import { defaultMapCanvasConfig, type MapCanvasConfig } from './config'

const storageKey = 'beach-bdf-map-canvas-preferences'

export function loadMapCanvasPreferences(): MapCanvasConfig {
  if (typeof localStorage === 'undefined') {
    return defaultMapCanvasConfig
  }

  const stored = localStorage.getItem(storageKey)

  if (!stored) {
    return defaultMapCanvasConfig
  }

  try {
    return mergeMapCanvasConfig(defaultMapCanvasConfig, JSON.parse(stored) as Partial<MapCanvasConfig>)
  } catch {
    return defaultMapCanvasConfig
  }
}

export function saveMapCanvasPreferences(config: MapCanvasConfig): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(storageKey, JSON.stringify(config))
}

export function mergeMapCanvasConfig(
  base: MapCanvasConfig,
  patch: Partial<MapCanvasConfig>,
): MapCanvasConfig {
  return {
    beach: { ...base.beach, ...patch.beach },
    grid: { ...base.grid, ...patch.grid },
    background: { ...base.background, ...patch.background },
    assets: { ...base.assets, ...patch.assets },
    zones: { ...base.zones, ...patch.zones },
    interaction: { ...base.interaction, ...patch.interaction },
    rules: { ...base.rules, ...patch.rules },
    walkways: { ...base.walkways, ...patch.walkways },
  }
}
