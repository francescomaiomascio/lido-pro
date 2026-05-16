import { getBeachItemStatusLabel } from '../format/beachLabels'
import { formatEuroFromCents } from '../format/money'
import { reservationTypeLabels } from '../format/reservationLabels'
import type { OperationalEditorKey } from '../state/operationalPanelState'
import type { Payment } from '../types/account'
import type { BeachItem, BeachItemStatusEvent } from '../types/beach'
import type { AccountExtraItem } from '../types/extraItem'
import type { TariffIncludedItem } from '../types/extraItem'
import type { Reservation } from '../types/reservation'
import type { PriceSuggestion } from '../types/tariff'

export type OperationalRowKey =
  | 'customer'
  | 'period'
  | 'account'
  | 'payments'
  | 'extra'
  | 'registry'
  | 'technical'

export interface OperationalRow {
  key: OperationalRowKey
  label: string
  value: string
  enabled: boolean
  actionLabel: string
  disabledReason?: string
  editorType: OperationalEditorKey
  secondary?: boolean
}

export function buildOperationalRows(input: {
  item: BeachItem
  reservation?: Reservation | null
  priceSuggestion: PriceSuggestion | null
  payments: Payment[]
  extras: AccountExtraItem[]
  includedEquipment: TariffIncludedItem[]
  events: BeachItemStatusEvent[]
}): OperationalRow[] {
  const { item, payments, extras, includedEquipment, events } = input
  const customer = item.assignedCustomer
  const reservation = input.reservation ?? item.currentReservation
  const account = item.activeAccount
  const periodValue = reservation
    ? `${reservationTypeLabels[reservation.reservationType]} · ${reservation.startDate} - ${reservation.endDate}`
    : customer
      ? 'Non impostato'
      : 'Bloccato · assegna prima un cliente'
  const accountValue = account
    ? `Dovuto ${formatEuroFromCents(account.totalAmountCents)} · Saldo ${formatEuroFromCents(account.balanceAmountCents)}`
    : reservation
      ? 'Conto in preparazione'
      : 'Bloccato · imposta cliente e periodo'
  const paymentTotal = account?.paidAmountCents ?? 0
  const paymentValue = account
    ? payments.length
      ? `Pagato ${formatEuroFromCents(paymentTotal)} · ${payments.length} pagamenti`
      : 'Nessun pagamento'
    : 'Apri prima un conto'
  const extraValue = account
    ? includedEquipment.length
      ? `Inclusi: ${includedEquipment.map((item) => `${item.quantity} ${item.name.toLowerCase()}`).join(', ')}`
      : extras.length
        ? `${extras.length} extra · ${formatEuroFromCents(extras.reduce((total, extra) => total + extra.totalAmountCents, 0))}`
        : 'Nessun extra'
    : 'Apri prima un conto'
  const recentEvent = events[0]

  return [
    {
      key: 'customer',
      label: 'Cliente',
      value: customer ? customer.customer.fullName : 'Nessun cliente',
      enabled: true,
      actionLabel: customer ? 'Cambia' : 'Assegna',
      editorType: 'customer',
    },
    {
      key: 'period',
      label: 'Periodo',
      value: periodValue,
      enabled: Boolean(customer),
      actionLabel: reservation ? 'Modifica' : 'Imposta',
      disabledReason: 'Assegna prima un cliente',
      editorType: 'period',
    },
    {
      key: 'account',
      label: 'Economia',
      value: accountValue,
      enabled: Boolean(customer && reservation),
      actionLabel: account ? 'Modifica' : '-',
      disabledReason: 'Imposta cliente e periodo',
      editorType: 'account',
    },
    {
      key: 'payments',
      label: 'Pagamenti',
      value: paymentValue,
      enabled: Boolean(account),
      actionLabel: 'Aggiungi',
      disabledReason: 'Imposta prima il periodo',
      editorType: 'payments',
    },
    {
      key: 'extra',
      label: 'Extra',
      value: extraValue,
      enabled: Boolean(account),
      actionLabel: 'Modifica',
      disabledReason: 'Apri prima un conto',
      editorType: 'extra',
    },
    {
      key: 'registry',
      label: 'Registro',
      value: recentEvent ? `${getBeachItemStatusLabel(recentEvent.nextStatus)} · ${recentEvent.createdAt.slice(0, 10)}` : 'Nessun movimento recente',
      enabled: true,
      actionLabel: 'Apri',
      editorType: null,
    },
    {
      key: 'technical',
      label: 'Tecnico',
      value: 'Coordinate e ID',
      enabled: true,
      actionLabel: 'Mostra',
      editorType: 'technical',
      secondary: true,
    },
  ]
}
