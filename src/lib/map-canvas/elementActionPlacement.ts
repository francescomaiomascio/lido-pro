export type ElementActionPanelPlacement =
  | 'right'
  | 'top'
  | 'left'
  | 'bottom'
  | 'dock-right'
  | 'dock-bottom'

export interface ElementActionPlacementInput {
  anchorXPx: number
  anchorYPx: number
  panelWidthPx: number
  panelHeightPx: number
  viewportWidthPx: number
  viewportHeightPx: number
  safeMarginPx: number
  rightReservePx?: number
  bottomReservePx?: number
  topReservePx?: number
}

export interface ElementActionPlacementResult {
  placement: ElementActionPanelPlacement
  xPx: number
  yPx: number
  transformOrigin: string
  docked: boolean
}

type Candidate = {
  placement: ElementActionPanelPlacement
  xPx: number
  yPx: number
  transformOrigin: string
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export function computeElementActionPanelPlacement(
  input: ElementActionPlacementInput,
): ElementActionPlacementResult {
  const safeLeft = input.safeMarginPx
  const safeTop = input.safeMarginPx + (input.topReservePx ?? 0)
  const safeRight = input.viewportWidthPx - input.safeMarginPx - (input.rightReservePx ?? 0)
  const safeBottom = input.viewportHeightPx - input.safeMarginPx - (input.bottomReservePx ?? 0)

  const dockBottom: Candidate = {
    placement: 'dock-bottom',
    xPx: safeRight - input.panelWidthPx,
    yPx: safeBottom - input.panelHeightPx,
    transformOrigin: 'right bottom',
  }

  return {
    placement: dockBottom.placement,
    xPx: clamp(dockBottom.xPx, safeLeft, Math.max(safeLeft, safeRight - input.panelWidthPx)),
    yPx: clamp(dockBottom.yPx, safeTop, Math.max(safeTop, safeBottom - input.panelHeightPx)),
    transformOrigin: dockBottom.transformOrigin,
    docked: true,
  }
}
