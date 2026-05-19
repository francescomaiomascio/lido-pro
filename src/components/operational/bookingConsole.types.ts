import type { OperationalPanelTab } from '../../lib/state/operationalPanelState'

export type BookingWorkspaceMode =
  | 'overview'
  | 'assign-customer'
  | 'edit-period'
  | 'manage-extras'
  | 'edit-due'
  | 'add-payment'

export type BookingCueTone = 'todo' | 'open' | 'partial' | 'done'

export type BookingFlowStep = {
  key: string
  label: string
  done: boolean
  active: boolean
  action: OperationalPanelTab
  enabled?: boolean
  reason?: string
}
