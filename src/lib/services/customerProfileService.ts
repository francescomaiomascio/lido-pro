import { getAccountsForCustomer, getPaymentsForAccount } from '../db/accountRepository'
import { getActiveLayout, getBeachItems } from '../db/beachRepository'
import { getCustomer, getCustomerAssignments, searchCustomers } from '../db/customerRepository'
import { getExtraItemsForAccount } from '../db/extraItemRepository'
import { getReservationsForCustomer } from '../db/reservationRepository'
import { getTodayIsoDate } from '../format/dateRange'
import { beachTypeLabels } from '../format/beachLabels'
import type { Account, Payment } from '../types/account'
import type { BeachItem } from '../types/beach'
import type { BeachItemCustomerAssignment, Customer } from '../types/customer'
import type { AccountExtraItem } from '../types/extraItem'
import type { Reservation } from '../types/reservation'
import type {
  CustomerAccountSummary,
  CustomerCurrentActivity,
  CustomerPaymentSummary,
  CustomerProfile,
  CustomerReservationSummary,
  CustomerSearchSummary,
} from '../types/customerProfile'

type CustomerProjectionData = {
  customer: Customer
  assignments: BeachItemCustomerAssignment[]
  reservations: Reservation[]
  accounts: Account[]
  paymentsByAccountId: Map<string, Payment[]>
  extrasByAccountId: Map<string, AccountExtraItem[]>
  itemsById: Map<string, BeachItem>
}

const isCurrentReservation = (reservation: Reservation, today = getTodayIsoDate()) =>
  reservation.active &&
  ['draft', 'active'].includes(reservation.status) &&
  reservation.startDate <= today &&
  today <= reservation.endDate

const sortReservationsDesc = (a: Reservation, b: Reservation) =>
  b.startDate.localeCompare(a.startDate) || b.createdAt.localeCompare(a.createdAt)

const sortPaymentsDesc = (a: Payment, b: Payment) =>
  b.paidAt.localeCompare(a.paidAt) || b.createdAt.localeCompare(a.createdAt)

const getActiveAssignment = (assignments: BeachItemCustomerAssignment[]) =>
  assignments
    .filter((assignment) => assignment.active)
    .toSorted((a, b) => b.assignedAt.localeCompare(a.assignedAt))[0] ?? null

const getAccountForReservation = (reservation: Reservation, accounts: Account[]) =>
  (reservation.accountId ? accounts.find((account) => account.id === reservation.accountId) : null) ??
  accounts.find((account) => account.itemId === reservation.itemId && account.customerId === reservation.customerId) ??
  null

const getExtrasSummary = (extras: AccountExtraItem[]) => {
  const activeExtras = extras.filter((extra) => extra.active)
  if (activeExtras.length === 0) {
    return 'Nessun extra'
  }

  return activeExtras
    .slice(0, 3)
    .map((extra) => `${extra.name} x${extra.quantity}`)
    .join(', ')
}

const toReservationSummary = (
  reservation: Reservation,
  accounts: Account[],
  itemsById: Map<string, BeachItem>,
  extrasByAccountId: Map<string, AccountExtraItem[]>,
): CustomerReservationSummary => {
  const item = itemsById.get(reservation.itemId)
  const account = getAccountForReservation(reservation, accounts)
  const extras = account ? (extrasByAccountId.get(account.id) ?? []) : []

  return {
    reservationId: reservation.id,
    type: reservation.reservationType,
    status: reservation.status,
    startDate: reservation.startDate,
    endDate: reservation.endDate,
    itemCode: item?.code ?? reservation.itemId,
    itemType: item?.type ?? 'palm',
    accountStatus: account?.status ?? null,
    totalAmountCents: account?.totalAmountCents ?? 0,
    paidAmountCents: account?.paidAmountCents ?? 0,
    balanceAmountCents: account?.balanceAmountCents ?? 0,
    extrasSummary: getExtrasSummary(extras),
  }
}

const loadItemsById = async () => {
  const layout = await getActiveLayout()
  const items = await getBeachItems(layout.id)
  return new Map(items.map((item) => [item.id, item]))
}

const loadProjectionData = async (customerId: string): Promise<CustomerProjectionData | null> => {
  const customer = await getCustomer(customerId)
  if (!customer) {
    return null
  }

  const [assignments, reservations, accounts, itemsById] = await Promise.all([
    getCustomerAssignments(customerId),
    getReservationsForCustomer(customerId),
    getAccountsForCustomer(customerId),
    loadItemsById(),
  ])

  const paymentsEntries = await Promise.all(
    accounts.map(async (account) => [account.id, await getPaymentsForAccount(account.id)] as const),
  )
  const extrasEntries = await Promise.all(
    accounts.map(async (account) => [account.id, await getExtraItemsForAccount(account.id)] as const),
  )

  return {
    customer,
    assignments,
    reservations,
    accounts,
    paymentsByAccountId: new Map(paymentsEntries),
    extrasByAccountId: new Map(extrasEntries),
    itemsById,
  }
}

export const getCustomerAccountSummary = async (
  customerId: string,
): Promise<CustomerAccountSummary> => {
  const accounts = await getAccountsForCustomer(customerId)
  return {
    totalAccounts: accounts.length,
    openAccounts: accounts.filter((account) => account.active && account.status !== 'paid').length,
    paidAccounts: accounts.filter((account) => account.status === 'paid').length,
    totalAmountCents: accounts.reduce((sum, account) => sum + account.totalAmountCents, 0),
    paidAmountCents: accounts.reduce((sum, account) => sum + account.paidAmountCents, 0),
    balanceAmountCents: accounts.reduce((sum, account) => sum + account.balanceAmountCents, 0),
  }
}

export const getCustomerCurrentActivity = async (
  customerId: string,
): Promise<CustomerCurrentActivity> => {
  const data = await loadProjectionData(customerId)
  if (!data) {
    return { assignment: null, reservation: null, beachItem: null, account: null }
  }

  const currentReservation =
    data.reservations
      .filter((reservation) => isCurrentReservation(reservation))
      .toSorted((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null
  const currentAssignment = getActiveAssignment(data.assignments)
  const itemId = currentReservation?.itemId ?? currentAssignment?.itemId ?? null
  const currentBeachItem = itemId ? data.itemsById.get(itemId) ?? null : null
  const currentAccount =
    (currentReservation ? getAccountForReservation(currentReservation, data.accounts) : null) ??
    (itemId ? data.accounts.find((account) => account.itemId === itemId && account.active) ?? null : null)

  return {
    assignment: currentAssignment,
    reservation: currentReservation,
    beachItem: currentBeachItem,
    account: currentAccount,
  }
}

export const getCustomerReservationHistory = async (
  customerId: string,
): Promise<CustomerReservationSummary[]> => {
  const data = await loadProjectionData(customerId)
  if (!data) {
    return []
  }

  return data.reservations
    .toSorted(sortReservationsDesc)
    .map((reservation) =>
      toReservationSummary(reservation, data.accounts, data.itemsById, data.extrasByAccountId),
    )
}

export const getCustomerRecentReservations = async (customerId: string, limit = 5) =>
  (await getCustomerReservationHistory(customerId)).slice(0, limit)

export const getCustomerPaymentHistory = async (
  customerId: string,
  limit?: number,
): Promise<CustomerPaymentSummary[]> => {
  const data = await loadProjectionData(customerId)
  if (!data) {
    return []
  }

  const reservationsByAccountId = new Map(
    data.reservations
      .filter((reservation) => reservation.accountId)
      .map((reservation) => [reservation.accountId as string, reservation]),
  )

  const payments = data.accounts.flatMap((account) => {
    const reservation = reservationsByAccountId.get(account.id) ?? null
    const item = data.itemsById.get(reservation?.itemId ?? account.itemId)
    return (data.paymentsByAccountId.get(account.id) ?? []).map((payment) => ({
      ...payment,
      itemCode: item?.code ?? null,
      reservationId: reservation?.id ?? null,
      accountStatus: account.status,
    }))
  }).toSorted(sortPaymentsDesc)

  return typeof limit === 'number' ? payments.slice(0, limit) : payments
}

export const getCustomerProfile = async (customerId: string): Promise<CustomerProfile | null> => {
  const data = await loadProjectionData(customerId)
  if (!data) {
    return null
  }

  const currentActivity = await getCustomerCurrentActivity(customerId)
  const accountSummary = await getCustomerAccountSummary(customerId)
  const recentReservations = data.reservations
    .toSorted(sortReservationsDesc)
    .slice(0, 5)
    .map((reservation) =>
      toReservationSummary(reservation, data.accounts, data.itemsById, data.extrasByAccountId),
    )
  const recentPayments = await getCustomerPaymentHistory(customerId, 5)
  const extrasAmountCents = [...data.extrasByAccountId.values()]
    .flat()
    .filter((extra) => extra.active)
    .reduce((sum, extra) => sum + extra.totalAmountCents, 0)

  return {
    customer: data.customer,
    currentAssignment: currentActivity.assignment,
    currentReservation: currentActivity.reservation,
    currentBeachItem: currentActivity.beachItem,
    currentAccount: currentActivity.account,
    accountSummary,
    recentReservations,
    recentPayments,
    totals: {
      reservations: data.reservations.length,
      payments: recentPayments.length,
      extrasAmountCents,
    },
  }
}

export const searchCustomersWithSummary = async (
  query: string,
): Promise<CustomerSearchSummary[]> => {
  const customers = await searchCustomers(query)
  return Promise.all(
    customers.map(async (customer) => {
      const [activity, accountSummary] = await Promise.all([
        getCustomerCurrentActivity(customer.id),
        getCustomerAccountSummary(customer.id),
      ])
      const itemLabel = activity.beachItem
        ? `${beachTypeLabels[activity.beachItem.type]} ${activity.beachItem.code}`
        : null
      const hasOpenBalance = accountSummary.balanceAmountCents > 0
      const status = hasOpenBalance
        ? 'open-balance'
        : activity.reservation || activity.assignment
          ? 'active'
          : 'no-active-reservation'
      const currentActivityLabel = activity.reservation
        ? itemLabel
          ? `Prenotazione · ${itemLabel}`
          : 'Prenotazione'
        : activity.assignment && itemLabel
          ? itemLabel
          : 'Nessuna attività'

      return {
        customer,
        currentActivityLabel,
        status,
        balanceAmountCents: accountSummary.balanceAmountCents,
      }
    }),
  )
}
