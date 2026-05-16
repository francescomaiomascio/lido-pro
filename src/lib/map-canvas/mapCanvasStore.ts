import { writable } from 'svelte/store'
import { defaultMapCanvasConfig, type MapCanvasConfig } from './config'
import { loadMapCanvasPreferences, saveMapCanvasPreferences } from './preferences'

const createMapCanvasConfigStore = () => {
  const { subscribe, set, update } = writable<MapCanvasConfig>(defaultMapCanvasConfig)

  const persist = (config: MapCanvasConfig) => {
    saveMapCanvasPreferences(config)
    return config
  }

  return {
    subscribe,
    hydrate: () => set(loadMapCanvasPreferences()),
    reset: () => set(persist(defaultMapCanvasConfig)),
    updateConfig: (updater: (config: MapCanvasConfig) => MapCanvasConfig) =>
      update((config) => persist(updater(config))),
  }
}

export const mapCanvasConfigStore = createMapCanvasConfigStore()
