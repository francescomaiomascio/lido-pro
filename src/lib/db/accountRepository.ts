import { getBeachDatabase } from './database'
import type {
  Account,
  AccountInput,
  Payment,
  PaymentSchedule,
  PaymentScheduleInput,
  PaymentMethod,
} from '../types/account'

export const createAccountForAssignment = async (input: AccountInput): Promise<Account> => {
  return getBeachDatabase().createAccountForAssignment(input)
}

export const getAccount = async (accountId: string): Promise<Account | null> => {
  return getBeachDatabase().getAccount(accountId)
}

export const getActiveAccountForItem = async (itemId: string): Promise<Account | null> => {
  return getBeachDatabase().getActiveAccountForItem(itemId)
}

export const getAccountsForCustomer = async (customerId: string): Promise<Account[]> => {
  return getBeachDatabase().getAccountsForCustomer(customerId)
}

export const updateAccountTotal = async (
  accountId: string,
  totalAmountCents: number,
  notes?: string | null,
): Promise<Account> => {
  return getBeachDatabase().updateAccountTotal(accountId, totalAmountCents, notes)
}

export const addPayment = async (
  accountId: string,
  amountCents: number,
  paymentMethod: PaymentMethod,
  note?: string,
): Promise<Payment> => {
  return getBeachDatabase().addPayment(accountId, amountCents, paymentMethod, note)
}

export const getPaymentsForAccount = async (accountId: string): Promise<Payment[]> => {
  return getBeachDatabase().getPaymentsForAccount(accountId)
}

export const createOrUpdatePaymentSchedule = async (
  input: PaymentScheduleInput,
): Promise<PaymentSchedule> => {
  return getBeachDatabase().createOrUpdatePaymentSchedule(input)
}

export const recalculateAccountBalance = async (accountId: string): Promise<Account> => {
  return getBeachDatabase().recalculateAccountBalance(accountId)
}

export const closeAccount = async (accountId: string): Promise<Account> => {
  return getBeachDatabase().closeAccount(accountId)
}

export const cancelAccount = async (accountId: string): Promise<Account> => {
  return getBeachDatabase().cancelAccount(accountId)
}
