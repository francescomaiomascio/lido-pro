import {
  addPayment as addPaymentRecord,
  closeAccount as closeAccountRecord,
  createOrUpdatePaymentSchedule as createOrUpdatePaymentScheduleRecord,
  createAccountForAssignment,
  getActiveAccountForItem,
  getAccountsForCustomer,
  getPaymentsForAccount,
  updateAccountTotal as updateAccountTotalRecord,
} from '../db/accountRepository'
import type { Account, AccountInput, Payment, PaymentMethod } from '../types/account'
import type { PaymentSchedule, PaymentScheduleInput } from '../types/account'
import type { BeachState } from '../types/db'
import { loadBeachState } from './beachLayoutService'

export const createAccount = async (input: AccountInput): Promise<Account> => {
  return createAccountForAssignment(input)
}

export const createAccountAndReload = async (input: AccountInput): Promise<BeachState> => {
  await createAccountForAssignment(input)
  return loadBeachState()
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
  return loadBeachState()
}

export const addPaymentAndReload = async (
  accountId: string,
  amountCents: number,
  paymentMethod: PaymentMethod,
  note?: string,
): Promise<BeachState> => {
  await addPaymentRecord(accountId, amountCents, paymentMethod, note)
  return loadBeachState()
}

export const closeAccountAndReload = async (accountId: string): Promise<BeachState> => {
  await closeAccountRecord(accountId)
  return loadBeachState()
}

export const loadPaymentsForAccount = async (accountId: string): Promise<Payment[]> => {
  return getPaymentsForAccount(accountId)
}

export const createOrUpdatePaymentSchedule = async (
  input: PaymentScheduleInput,
): Promise<PaymentSchedule> => {
  return createOrUpdatePaymentScheduleRecord(input)
}
