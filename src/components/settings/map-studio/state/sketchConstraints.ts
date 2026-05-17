export type SketchConstraintKind =
  | 'distance'
  | 'rowSpacing'
  | 'zoneMargin'
  | 'seaMargin'
  | 'borderMargin'

export interface SketchConstraint {
  id: string
  kind: SketchConstraintKind
  label: string
  valueM: number
  entityIds: string[]
  status: 'draft' | 'valid' | 'warning' | 'stale'
}
