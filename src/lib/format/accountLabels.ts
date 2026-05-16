import type { AccountStatus, AccountType, PaymentMethod } from '../types/account'

export const accountStatusLabels: Record<AccountStatus, string> = {
  open: 'Aperto',
  partial: 'Parziale',
  paid: 'Pagato',
  cancelled: 'Annullato',
}

export const accountTypeLabels: Record<AccountType, string> = {
  daily: 'Giornaliero',
  seasonal: 'Stagionale',
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Contanti',
  card: 'Carta',
  transfer: 'Bonifico',
  other: 'Altro',
}

export const paymentMethodOptions: PaymentMethod[] = ['cash', 'card', 'transfer', 'other']
