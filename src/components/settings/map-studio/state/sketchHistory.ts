export interface SketchHistoryEntry {
  id: string
  label: string
  createdAt: number
}

export interface SketchHistoryState {
  past: SketchHistoryEntry[]
  future: SketchHistoryEntry[]
}

export const createSketchHistoryState = (): SketchHistoryState => ({ past: [], future: [] })
