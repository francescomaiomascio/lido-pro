export type OperationalPanelTab =
  | 'overview'
  | 'customer'
  | 'period'
  | 'tariff'
  | 'account'
  | 'payments'
  | 'extra'
  | 'history'
  | 'technical'

export type OperationalEditorKey =
  | 'customer'
  | 'period'
  | 'tariff'
  | 'account'
  | 'payments'
  | 'extra'
  | 'technical'
  | null

export type OperationalPanelSize = 'compact' | 'medium' | 'expanded'

export type OperationalPanelState = {
  isOpen: boolean
  isExpanded: boolean
  panelSize: OperationalPanelSize
  activeTab: OperationalPanelTab
  focusedItemId: string | null
  lastExpandedByUser: boolean
}

export const createOperationalPanelState = (): OperationalPanelState => ({
  isOpen: true,
  isExpanded: false,
  panelSize: 'compact',
  activeTab: 'overview',
  focusedItemId: null,
  lastExpandedByUser: false,
})
