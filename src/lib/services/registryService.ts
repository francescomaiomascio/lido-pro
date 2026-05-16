import { getAccountsForCustomer, getPaymentsForAccount } from '../db/accountRepository'
import { getActiveLayout, getBeachItems } from '../db/beachRepository'
import { getActiveCustomers } from '../db/customerRepository'
import { getExtraItemsForAccount } from '../db/extraItemRepository'
import { getReservationsForCustomer } from '../db/reservationRepository'
import type { Account, Payment } from '../types/account'
import type { BeachItem } from '../types/beach'
import type { Customer } from '../types/customer'
import type { AccountExtraItem } from '../types/extraItem'
import type { Reservation } from '../types/reservation'
import type { RegistryFilters } from '../state/registryFilters'
import type { RegistryRecord, RegistrySummary } from '../types/registry'
import { getBeachDisplayCode } from '../format/beachDisplayCodes'

const toSearchText = (...values: Array<string | null | undefined>) =>
  values.filter(Boolean).join(' ').trim().toLowerCase()

const getYearRange = (year: number) => ({
  start: `${year}-01-01`,
  end: `${year}-12-31`,
})

const getFilterDateRange = (filters: RegistryFilters) => {
  const yearRange = getYearRange(filters.year)
  return {
    start: filters.dateFrom || yearRange.start,
    end: filters.dateTo || yearRange.end,
  }
}

const doesRangeOverlap = (
  startDate: string | null,
  endDate: string | null,
  filterStart: string,
  filterEnd: string,
) => {
  if (!startDate || !endDate) {
    return false
  }
  return startDate <= filterEnd && filterStart <= endDate
}

const getAccountDate = (account: Account) => account.openedAt.slice(0, 10)

const sortPaymentsDesc = (a: Payment, b: Payment) =>
  b.paidAt.localeCompare(a.paidAt) || b.createdAt.localeCompare(a.createdAt)

const getExtrasSummary = (extras: AccountExtraItem[]) => {
  const activeExtras = extras.filter((extra) => extra.active)
  if (activeExtras.length === 0) {
    return 'Nessun extra'
  }

  const preview = activeExtras.slice(0, 3).map((extra) => `${extra.name} x${extra.quantity}`)
  return activeExtras.length > 3 ? `${preview.join(', ')} +${activeExtras.length - 3}` : preview.join(', ')
}

const findAccountForReservation = (
  reservation: Reservation,
  accounts: Account[],
  usedAccountIds: Set<string>,
) => {
  if (reservation.accountId) {
    const linked = accounts.find((account) => account.id === reservation.accountId)
    if (linked) {
      return linked
    }
  }

  return (
    accounts.find(
      (account) =>
        !usedAccountIds.has(account.id) &&
        account.itemId === reservation.itemId &&
        account.customerId === reservation.customerId &&
        account.status !== 'cancelled',
    ) ?? null
  )
}

const toReservationRecord = async (
  reservation: Reservation,
  customer: Customer,
  item: BeachItem | null,
  account: Account | null,
  allItems: BeachItem[],
): Promise<RegistryRecord> => {
  const [payments, extras] = await Promise.all([
    account ? getPaymentsForAccount(account.id) : Promise.resolve([]),
    account ? getExtraItemsForAccount(account.id) : Promise.resolve([]),
  ])
  const sortedPayments = payments.toSorted(sortPaymentsDesc)

  return {
    id: `reservation:${reservation.id}`,
    kind: 'reservation',
    reservationId: reservation.id,
    accountId: account?.id ?? null,
    customerId: customer.id,
    itemId: reservation.itemId,
    customerName: customer.fullName,
    customerPhone: customer.phone ?? null,
    itemCode: item ? getBeachDisplayCode(item, allItems) : reservation.itemId,
    itemType: item?.type ?? null,
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
    notes: reservation.notes ?? account?.notes ?? null,
  }
}

const toAccountRecord = async (
  account: Account,
  customer: Customer,
  item: BeachItem | null,
  allItems: BeachItem[],
): Promise<RegistryRecord> => {
  const [payments, extras] = await Promise.all([
    getPaymentsForAccount(account.id),
    getExtraItemsForAccount(account.id),
  ])
  const sortedPayments = payments.toSorted(sortPaymentsDesc)

  return {
    id: `account:${account.id}`,
    kind: 'account',
    reservationId: null,
    accountId: account.id,
    customerId: customer.id,
    itemId: account.itemId,
    customerName: customer.fullName,
    customerPhone: customer.phone ?? null,
    itemCode: item ? getBeachDisplayCode(item, allItems) : account.itemId,
    itemType: item?.type ?? null,
    reservationType: account.accountType,
    reservationStatus: null,
    startDate: getAccountDate(account),
    endDate: getAccountDate(account),
    accountStatus: account.status,
    totalAmountCents: account.totalAmountCents,
    paidAmountCents: account.paidAmountCents,
    balanceAmountCents: account.balanceAmountCents,
    paymentCount: payments.length,
    lastPaymentDate: sortedPayments[0]?.paidAt ?? null,
    extrasSummary: getExtrasSummary(extras),
    notes: account.notes ?? null,
  }
}

const loadItemContext = async () => {
  const layout = await getActiveLayout()
  const items = await getBeachItems(layout.id)
  return {
    items,
    itemsById: new Map(items.map((item) => [item.id, item])),
  }
}

const applyFilters = (records: RegistryRecord[], filters: RegistryFilters) => {
  const { start, end } = getFilterDateRange(filters)
  const customerQuery = filters.customerQuery.trim().toLowerCase()
  const itemQuery = filters.itemQuery.trim().toLowerCase()

  return records.filter((record) => {
    if (!doesRangeOverlap(record.startDate, record.endDate, start, end)) {
      return false
    }

    if (
      filters.customerId &&
      record.customerId !== filters.customerId
    ) {
      return false
    }

    if (
      customerQuery &&
      !toSearchText(record.customerName, record.customerPhone).includes(customerQuery)
    ) {
      return false
    }

    if (filters.itemId && record.itemId !== filters.itemId) {
      return false
    }

    if (itemQuery && !toSearchText(record.itemCode, record.itemType).includes(itemQuery)) {
      return false
    }

    if (filters.reservationType !== 'all' && record.reservationType !== filters.reservationType) {
      return false
    }

    if (
      filters.reservationStatus !== 'all' &&
      record.reservationStatus !== filters.reservationStatus
    ) {
      return false
    }

    if (filters.accountStatus !== 'all' && record.accountStatus !== filters.accountStatus) {
      return false
    }

    if (filters.onlyOpenBalance && record.balanceAmountCents <= 0) {
      return false
    }

    if (filters.onlyPaid && record.accountStatus !== 'paid') {
      return false
    }

    if (filters.onlyActiveReservations && record.reservationStatus !== 'active') {
      return false
    }

    return true
  })
}

const sortRegistryRecords = (records: RegistryRecord[]) =>
  records.toSorted((a, b) => {
    const dateCompare = (b.startDate ?? '').localeCompare(a.startDate ?? '')
    return dateCompare || a.customerName.localeCompare(b.customerName) || a.itemCode.localeCompare(b.itemCode)
  })

const loadRegistryRecords = async (): Promise<RegistryRecord[]> => {
  const [customers, itemContext] = await Promise.all([getActiveCustomers(), loadItemContext()])
  const { items, itemsById } = itemContext
  const records: RegistryRecord[] = []

  for (const customer of customers) {
    const [reservations, accounts] = await Promise.all([
      getReservationsForCustomer(customer.id),
      getAccountsForCustomer(customer.id),
    ])
    const usedAccountIds = new Set<string>()

    for (const reservation of reservations) {
      const account = findAccountForReservation(reservation, accounts, usedAccountIds)
      if (account) {
        usedAccountIds.add(account.id)
      }
      records.push(
        await toReservationRecord(
          reservation,
          customer,
          itemsById.get(reservation.itemId) ?? null,
          account,
          items,
        ),
      )
    }

    for (const account of accounts) {
      if (usedAccountIds.has(account.id)) {
        continue
      }
      records.push(await toAccountRecord(account, customer, itemsById.get(account.itemId) ?? null, items))
    }
  }

  return records
}

export const getRegistryRecords = async (
  filters: RegistryFilters,
): Promise<RegistryRecord[]> => {
  return sortRegistryRecords(applyFilters(await loadRegistryRecords(), filters))
}

export const calculateRegistrySummary = (records: RegistryRecord[]): RegistrySummary => {
  const customerIds = new Set(records.map((record) => record.customerId))

  return {
    totalReservations: records.filter((record) => record.reservationId).length,
    totalCustomers: customerIds.size,
    totalDueCents: records.reduce((sum, record) => sum + record.totalAmountCents, 0),
    totalPaidCents: records.reduce((sum, record) => sum + record.paidAmountCents, 0),
    totalBalanceCents: records.reduce((sum, record) => sum + record.balanceAmountCents, 0),
    openAccounts: records.filter((record) => record.accountStatus === 'open').length,
    paidAccounts: records.filter((record) => record.accountStatus === 'paid').length,
    partialAccounts: records.filter((record) => record.accountStatus === 'partial').length,
  }
}

export const getRegistrySummary = async (filters: RegistryFilters): Promise<RegistrySummary> => {
  return calculateRegistrySummary(await getRegistryRecords(filters))
}

export const getSeasonRegistry = async (year: number): Promise<RegistryRecord[]> => {
  return getRegistryRecords({
    year,
    dateFrom: '',
    dateTo: '',
    customerId: null,
    customerQuery: '',
    itemId: null,
    itemQuery: '',
    reservationType: 'all',
    reservationStatus: 'all',
    accountStatus: 'all',
    onlyOpenBalance: false,
    onlyPaid: false,
    onlyActiveReservations: false,
  })
}

export const getCustomerRegistryRecords = async (
  customerId: string,
): Promise<RegistryRecord[]> => {
  return sortRegistryRecords((await loadRegistryRecords()).filter((record) => record.customerId === customerId))
}

export const searchRegistry = async (
  query: string,
  filters: RegistryFilters,
): Promise<RegistryRecord[]> => {
  return getRegistryRecords({
    ...filters,
    customerQuery: query,
  })
}
