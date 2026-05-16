export type RenderedMapSize = {
  scale: number
  widthPx: number
  heightPx: number
}

export const calculateFitScale = (
  containerWidthPx: number,
  containerHeightPx: number,
  layoutWidthM: number,
  layoutDepthM: number,
): number => {
  if (containerWidthPx <= 0 || containerHeightPx <= 0) {
    return 1
  }

  return Math.min(containerWidthPx / layoutWidthM, containerHeightPx / layoutDepthM)
}

export const calculateRenderedMapSize = (
  containerWidthPx: number,
  containerHeightPx: number,
  layoutWidthM: number,
  layoutDepthM: number,
): RenderedMapSize => {
  const scale = calculateFitScale(containerWidthPx, containerHeightPx, layoutWidthM, layoutDepthM)

  return {
    scale,
    widthPx: Math.floor(layoutWidthM * scale),
    heightPx: Math.floor(layoutDepthM * scale),
  }
}
