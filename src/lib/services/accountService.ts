import {
  addPayment as addPaymentRecord,
  closeAccount as closeAccountRecord,
  createOrUpdatePaymentSchedule as createOrUpdatePaymentScheduleRecord,
  createAccountForAssignment,
  getActiveAccountForItem,
  getAccount,
  getAccountsForCustomer,
  getPaymentsForAccount,
  updateAccountTotal as updateAccountTotalRecord,
} from '../db/accountRepository'
import { appendPaymentEvent } from '../registry/registryEventService'
import type { Account, AccountInput, Payment, PaymentMethod } from '../types/account'
import type { PaymentSchedule, PaymentScheduleInput } from '../types/account'
import type { BeachState } from '../types/db'
import { loadActiveOperationalBeachState } from './beachLayoutService'

export const createAccount = async (input: AccountInput): Promise<Account> => {
  return createAccountForAssignment(input)
}

export const createAccountAndReload = async (input: AccountInput): Promise<BeachState> => {
  await createAccountForAssignment(input)
  return loadActiveOperationalBeachState()
}

export const loadActiveAccountForItem = async (itemId: string): Promise<Account | null> => {
  return getActiveAccountForItem(itemId)
}

export const loadAccountsForCustomer = async (customerId: string): Promise<Account[]> => {
  return getAccountsForCustomer(customerId)
}

export const updateAccountTotalAndReload = async (
  accountId: string,
  totalAmountCents: number,
  notes = 'Manuale',
): Promise<BeachState> => {
  await updateAccountTotalRecord(accountId, totalAmountCents, notes)
  return loadActiveOperationalBeachState()
}

export const addPaymentAndReload = async (
  accountId: string,
  amountCents: number,
  paymentMethod: PaymentMethod,
  note?: string,
): Promise<BeachState> => {
  const payment = await addPaymentRecord(accountId, amountCents, paymentMethod, note)
  const account = await getAccount(accountId)
  await appendPaymentEvent({
    type: 'payment_recorded',
    severity: 'success',
    title: 'Pagamento registrato',
    description: note?.trim() || null,
    links: {
      entityType: 'payment',
      entityId: payment.id,
      accountId,
      paymentId: payment.id,
      customerId: account?.customerId ?? null,
      itemId: account?.itemId ?? null,
    },
    amountCents,
    payload: { paymentMethod },
    dedupeKey: `payment_recorded:${payment.id}`,
  })
  return loadActiveOperationalBeachState()
}

export const closeAccountAndReload = async (accountId: string): Promise<BeachState> => {
  await closeAccountRecord(accountId)
  return loadActiveOperationalBeachState()
}

export const loadPaymentsForAccount = async (accountId: string): Promise<Payment[]> => {
  return getPaymentsForAccount(accountId)
}

export const createOrUpdatePaymentSchedule = async (
  input: PaymentScheduleInput,
): Promise<PaymentSchedule> => {
  return createOrUpdatePaymentScheduleRecord(input)
}
