export type MapViewportState = {
  zoom: number
  panX: number
  panY: number
  minZoom: number
  maxZoom: number
  fitZoom: number
  isPanning: boolean
}

export const createMapViewportState = (): MapViewportState => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  minZoom: 1,
  maxZoom: 3,
  fitZoom: 1,
  isPanning: false,
})
