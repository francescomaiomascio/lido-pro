import { getAccount, getAccountsForCustomer, getPaymentsForAccount } from '../db/accountRepository'
import { getActiveLayout, getBeachItems } from '../db/beachRepository'
import { getCustomer } from '../db/customerRepository'
import { getExtraItemsForAccount } from '../db/extraItemRepository'
import {
  getCurrentReservationForItem,
  getReservation,
  getReservationsForCustomer,
  getReservationsForItem,
} from '../db/reservationRepository'
import { suggestPriceForReservation } from './tariffService'
import type { Account, Payment } from '../types/account'
import type { BeachItem } from '../types/beach'
import type { Customer } from '../types/customer'
import type { AccountExtraItem } from '../types/extraItem'
import type { Reservation } from '../types/reservation'
import type {
  AccountLedger,
  LedgerExtraRow,
  LedgerPaymentRow,
  ReservationSummary,
  ReservationTimelineEntry,
} from '../types/reservationSummary'
import { getBeachDisplayCode } from '../format/beachDisplayCodes'

const sortPaymentsDesc = (a: Payment, b: Payment) =>
  b.paidAt.localeCompare(a.paidAt) || b.createdAt.localeCompare(a.createdAt)

const getActiveExtras = (extras: AccountExtraItem[]) => extras.filter((extra) => extra.active)

const loadItemContext = async () => {
  const layout = await getActiveLayout()
  const items = await getBeachItems(layout.id)
  return {
    items,
    itemsById: new Map(items.map((item) => [item.id, item])),
  }
}

const loadItemsById = async () => (await loadItemContext()).itemsById

const getExtrasSummary = (extras: AccountExtraItem[]) => {
  const activeExtras = getActiveExtras(extras)
  if (activeExtras.length === 0) {
    return 'Nessun extra'
  }

  const preview = activeExtras.slice(0, 3).map((extra) => `${extra.name} x${extra.quantity}`)
  return activeExtras.length > 3 ? `${preview.join(', ')} +${activeExtras.length - 3}` : preview.join(', ')
}

const getIncludedItemsSummary = (extras: AccountExtraItem[]) =>
  getActiveExtras(extras).length > 0
    ? 'Extra collegati al conto. Incluso/pagato non ancora modellato.'
    : 'Nessun extra collegato'

const toPaymentRows = (payments: Payment[]): LedgerPaymentRow[] =>
  payments.toSorted(sortPaymentsDesc).map((payment) => ({
    id: payment.id,
    amountCents: payment.amountCents,
    paidAt: payment.paidAt,
    method: payment.paymentMethod,
    note: payment.note,
  }))

const toExtraRows = (extras: AccountExtraItem[]): LedgerExtraRow[] =>
  getActiveExtras(extras).map((extra) => ({
    id: extra.id,
    name: extra.name,
    quantity: extra.quantity,
    unitAmountCents: extra.unitAmountCents,
    totalAmountCents: extra.totalAmountCents,
    note: extra.notes,
    includedState: 'not-modeled',
  }))

const resolveAccountForReservation = async (reservation: Reservation): Promise<Account | null> => {
  if (reservation.accountId) {
    return getAccount(reservation.accountId)
  }

  const customerReservations = await getReservationsForCustomer(reservation.customerId)
  const accountReservation = customerReservations.find(
    (current) => current.id === reservation.id && current.accountId,
  )

  if (accountReservation?.accountId) {
    return getAccount(accountReservation.accountId)
  }

  const customerAccounts = await getAccountsForCustomer(reservation.customerId)
  return (
    customerAccounts.find(
      (account) => account.itemId === reservation.itemId && account.status !== 'cancelled',
    ) ??
    null
  )
}

const resolveReservationForAccount = async (account: Account): Promise<Reservation | null> => {
  const customerReservations = await getReservationsForCustomer(account.customerId)
  return (
    customerReservations.find((reservation) => reservation.accountId === account.id) ??
    customerReservations.find(
      (reservation) =>
        reservation.itemId === account.itemId &&
        reservation.customerId === account.customerId &&
        reservation.active,
    ) ??
    null
  )
}

const buildTimeline = (
  reservation: Reservation | null,
  account: Account | null,
  payments: Payment[],
  extras: AccountExtraItem[],
): ReservationTimelineEntry[] => {
  const entries: ReservationTimelineEntry[] = []

  if (reservation) {
    entries.push({
      id: `reservation-created-${reservation.id}`,
      label: 'Prenotazione creata',
      date: reservation.createdAt,
      detail: reservation.title ?? undefined,
      tone: 'neutral',
    })
  }

  if (account) {
    entries.push({
      id: `account-opened-${account.id}`,
      label: 'Conto aperto',
      date: account.openedAt,
      tone: account.balanceAmountCents > 0 ? 'warning' : 'positive',
    })
  }

  for (const extra of getActiveExtras(extras)) {
    entries.push({
      id: `extra-${extra.id}`,
      label: `Extra: ${extra.name}`,
      date: extra.createdAt,
      detail: `x${extra.quantity}`,
      tone: 'neutral',
    })
  }

  for (const payment of payments) {
    entries.push({
      id: `payment-${payment.id}`,
      label: 'Pagamento registrato',
      date: payment.paidAt,
      tone: 'positive',
    })
  }

  return entries.toSorted((a, b) => b.date.localeCompare(a.date))
}

const buildAccountLedger = async (
  account: Account,
  reservation: Reservation | null,
  customer: Customer | null,
  item: BeachItem | null,
): Promise<AccountLedger> => {
  const [payments, extras] = await Promise.all([
    getPaymentsForAccount(account.id),
    getExtraItemsForAccount(account.id),
  ])

  return {
    account,
    customer,
    reservation,
    item,
    baseAmountCents: account.baseAmountCents,
    extrasAmountCents: account.extrasAmountCents,
    totalAmountCents: account.totalAmountCents,
    paidAmountCents: account.paidAmountCents,
    balanceAmountCents: account.balanceAmountCents,
    payments,
    paymentRows: toPaymentRows(payments),
    extras,
    extraRows: toExtraRows(extras),
    accountStatus: account.status,
  }
}

const buildReservationSummary = async (
  reservation: Reservation,
  itemOverride?: BeachItem | null,
): Promise<ReservationSummary> => {
  const [customer, itemsById, account] = await Promise.all([
    getCustomer(reservation.customerId),
    itemOverride ? Promise.resolve(null) : loadItemContext(),
    resolveAccountForReservation(reservation),
  ])
  const beachItem = itemOverride ?? itemsById?.itemsById.get(reservation.itemId) ?? null
  const allItems = itemsById?.items ?? (beachItem ? [beachItem] : [])
  const [payments, extras, tariffSuggestion] = await Promise.all([
    account ? getPaymentsForAccount(account.id) : Promise.resolve([]),
    account ? getExtraItemsForAccount(account.id) : Promise.resolve([]),
    beachItem ? suggestPriceForReservation(beachItem, reservation) : Promise.resolve(null),
  ])
  const ledger = account
    ? await buildAccountLedger(account, reservation, customer, beachItem)
    : null
  const sortedPayments = payments.toSorted(sortPaymentsDesc)

  return {
    reservation,
    customer,
    beachItem,
    account,
    payments,
    extras,
    tariffSuggestion,
    ledger,
    reservationId: reservation.id,
    customerName: customer?.fullName ?? 'Cliente non disponibile',
    customerPhone: customer?.phone ?? null,
    customerEmail: customer?.email ?? null,
    itemCode: beachItem ? getBeachDisplayCode(beachItem, allItems) : reservation.itemId,
    itemType: beachItem?.type ?? null,
    reservationType: reservation.reservationType,
    reservationStatus: reservation.status,
    startDate: reservation.startDate,
    endDate: reservation.endDate,
    accountStatus: account?.status ?? null,
    totalAmountCents: account?.totalAmountCents ?? 0,
    paidAmountCents: account?.paidAmountCents ?? 0,
    balanceAmountCents: account?.balanceAmountCents ?? 0,
    paymentCount: payments.length,
    lastPaymentDate: sortedPayments[0]?.paidAt ?? null,
    extrasSummary: getExtrasSummary(extras),
    includedItemsSummary: getIncludedItemsSummary(extras),
    timeline: buildTimeline(reservation, account, payments, extras),
  }
}

export const getReservationSummary = async (
  reservationId: string,
): Promise<ReservationSummary | null> => {
  const reservation = await getReservation(reservationId)
  return reservation ? buildReservationSummary(reservation) : null
}

export const getReservationSummaryForItem = async (
  itemId: string,
): Promise<ReservationSummary | null> => {
  const reservations = await getReservationsForItem(itemId)
  const reservation = reservations.find((current) => current.active) ?? reservations[0] ?? null
  if (!reservation) {
    return null
  }
  const itemsById = await loadItemsById()
  return buildReservationSummary(reservation, itemsById.get(itemId) ?? null)
}

export const getCurrentReservationSummaryForItem = async (
  itemId: string,
  date?: string,
): Promise<ReservationSummary | null> => {
  const reservation = await getCurrentReservationForItem(itemId, date)
  if (!reservation) {
    return null
  }
  const itemsById = await loadItemsById()
  return buildReservationSummary(reservation, itemsById.get(itemId) ?? null)
}

export const getReservationLedger = async (
  reservationId: string,
): Promise<AccountLedger | null> => {
  return (await getReservationSummary(reservationId))?.ledger ?? null
}

export const getAccountLedger = async (accountId: string): Promise<AccountLedger | null> => {
  const account = await getAccount(accountId)
  if (!account) {
    return null
  }

  const [customer, reservation, itemsById] = await Promise.all([
    getCustomer(account.customerId),
    resolveReservationForAccount(account),
    loadItemsById(),
  ])
  const item = itemsById.get(account.itemId) ?? null
  return buildAccountLedger(account, reservation, customer, item)
}
