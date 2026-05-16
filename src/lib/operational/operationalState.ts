import type { Payment } from '../types/account'
import type { BeachItem } from '../types/beach'
import type { AccountExtraItem } from '../types/extraItem'

export type OperationalWorkflowState =
  | 'no_selection'
  | 'needs_customer'
  | 'needs_period'
  | 'account_open'
  | 'account_paid'
  | 'maintenance'

export type OperationalNextAction =
  | 'assign_customer'
  | 'set_period'
  | 'add_payment'
  | 'open_registry'
  | null

export interface OperationalState {
  state: OperationalWorkflowState
  nextAction: OperationalNextAction
  title: string
  message: string
  primaryActionLabel: string | null
  canShowCustomerDetails: boolean
  canShowPeriodDetails: boolean
  canShowEconomicDetails: boolean
  canShowExtras: boolean
}

export function getOperationalState(input: {
  item: BeachItem | null
  payments: Payment[]
  extras: AccountExtraItem[]
}): OperationalState {
  const { item } = input

  if (!item) {
    return {
      state: 'no_selection',
      nextAction: null,
      title: 'Spiaggia BDF',
      message: 'Seleziona un posto sulla mappa per iniziare.',
      primaryActionLabel: null,
      canShowCustomerDetails: false,
      canShowPeriodDetails: false,
      canShowEconomicDetails: false,
      canShowExtras: false,
    }
  }

  if (item.status === 'maintenance') {
    return {
      state: 'maintenance',
      nextAction: 'open_registry',
      title: 'Posto in manutenzione',
      message: 'Questo posto non e disponibile per una nuova gestione operativa.',
      primaryActionLabel: 'Apri registro',
      canShowCustomerDetails: Boolean(item.assignedCustomer),
      canShowPeriodDetails: Boolean(item.currentReservation),
      canShowEconomicDetails: Boolean(item.activeAccount),
      canShowExtras: Boolean(item.activeAccount),
    }
  }

  if (!item.assignedCustomer) {
    return {
      state: 'needs_customer',
      nextAction: 'assign_customer',
      title: 'Nessun cliente assegnato.',
      message: 'Per iniziare, assegna un cliente a questo posto.',
      primaryActionLabel: 'Assegna cliente',
      canShowCustomerDetails: false,
      canShowPeriodDetails: false,
      canShowEconomicDetails: false,
      canShowExtras: false,
    }
  }

  if (!item.currentReservation) {
    return {
      state: 'needs_period',
      nextAction: 'set_period',
      title: 'Cliente assegnato.',
      message: 'Prossimo passaggio: imposta il periodo della prenotazione.',
      primaryActionLabel: 'Imposta periodo',
      canShowCustomerDetails: true,
      canShowPeriodDetails: false,
      canShowEconomicDetails: false,
      canShowExtras: false,
    }
  }

  if (!item.activeAccount) {
    return {
      state: 'needs_period',
      nextAction: 'set_period',
      title: 'Prenotazione impostata.',
      message: 'Aggiorna il periodo per generare automaticamente il conto.',
      primaryActionLabel: 'Aggiorna periodo',
      canShowCustomerDetails: true,
      canShowPeriodDetails: true,
      canShowEconomicDetails: false,
      canShowExtras: false,
    }
  }

  if (item.activeAccount.balanceAmountCents > 0) {
    return {
      state: 'account_open',
      nextAction: 'add_payment',
      title: 'Conto aperto.',
      message: 'Registra il prossimo pagamento o aggiorna le dotazioni collegate.',
      primaryActionLabel: 'Aggiungi pagamento',
      canShowCustomerDetails: true,
      canShowPeriodDetails: true,
      canShowEconomicDetails: true,
      canShowExtras: true,
    }
  }

  return {
    state: 'account_paid',
    nextAction: 'open_registry',
    title: 'Conto saldato.',
    message: 'La gestione corrente e completa. Consulta il registro per lo storico.',
    primaryActionLabel: 'Apri registro',
    canShowCustomerDetails: true,
    canShowPeriodDetails: true,
    canShowEconomicDetails: true,
    canShowExtras: true,
  }
}
