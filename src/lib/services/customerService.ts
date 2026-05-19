import {
  assignCustomerToBeachItem,
  createCustomer as createCustomerRecord,
  getActiveCustomers,
  searchCustomers as searchCustomerRecords,
  unassignCustomerFromBeachItem,
  updateCustomer as updateCustomerRecord,
} from '../db/customerRepository'
import { normalizeCustomerInput, validateCustomerInput } from '../customers/customerValidation'
import type { Customer, CustomerAssignmentType, CustomerInput } from '../types/customer'
import type { BeachState } from '../types/db'
import { loadActiveOperationalBeachState } from './beachLayoutService'

export const loadCustomers = async (): Promise<Customer[]> => {
  return getActiveCustomers()
}

export const searchCustomers = async (query: string): Promise<Customer[]> => {
  return searchCustomerRecords(query)
}

export const createCustomer = async (input: CustomerInput): Promise<Customer> => {
  const validationError = validateCustomerInput(input)
  if (validationError) throw new Error(validationError)
  return createCustomerRecord(normalizeCustomerInput(input))
}

export const updateCustomer = async (
  customerId: string,
  input: CustomerInput,
): Promise<Customer> => {
  const validationError = validateCustomerInput(input)
  if (validationError) throw new Error(validationError)
  return updateCustomerRecord(customerId, normalizeCustomerInput(input))
}

export const assignCustomerToItem = async (
  itemId: string,
  customerId: string,
  assignmentType: CustomerAssignmentType,
  note?: string,
): Promise<BeachState> => {
  await assignCustomerToBeachItem(itemId, customerId, assignmentType, note)
  return loadActiveOperationalBeachState()
}

export const unassignCustomerFromItem = async (itemId: string): Promise<BeachState> => {
  await unassignCustomerFromBeachItem(itemId)
  return loadActiveOperationalBeachState()
}

export const loadBeachStateWithCustomers = async (): Promise<BeachState> => {
  return loadActiveOperationalBeachState()
}
