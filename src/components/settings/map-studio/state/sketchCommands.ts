import type { SketchCommandId } from './sketchTools'

export type SketchCommandState =
  | 'idle'
  | 'armed'
  | 'drawing'
  | 'dragging'
  | 'editing'
  | 'pendingConfirm'
  | 'committed'
  | 'cancelled'
  | 'blocked'

export interface SketchCommandRuntime {
  activeCommand: SketchCommandId
  state: SketchCommandState
  prompt: string
}

export const commandStateLabel = (state: SketchCommandState) => {
  if (state === 'armed') return 'pronto'
  if (state === 'drawing') return 'disegno'
  if (state === 'dragging') return 'trascina'
  if (state === 'editing') return 'modifica'
  if (state === 'pendingConfirm') return 'da confermare'
  if (state === 'blocked') return 'bloccato'
  return 'in attesa'
}
