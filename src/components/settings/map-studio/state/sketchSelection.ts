import type { SketchCommandId } from './sketchTools'

export interface SketchSelectionState {
  selectedEntityId?: string
  hoveredEntityId?: string
  selectedHandleId?: string
  activeCommand: SketchCommandId
}

export const createSketchSelectionState = (activeCommand: SketchCommandId): SketchSelectionState => ({
  activeCommand,
})
