import { getBeachDatabase } from './database'
import type {
  BeachItemAssignedCustomer,
  BeachItemCustomerAssignment,
  Customer,
  CustomerAssignmentType,
  CustomerInput,
} from '../types/customer'

export const createCustomer = async (input: CustomerInput): Promise<Customer> => {
  return getBeachDatabase().createCustomer(input)
}

export const updateCustomer = async (
  customerId: string,
  input: CustomerInput,
): Promise<Customer> => {
  return getBeachDatabase().updateCustomer(customerId, input)
}

export const getCustomer = async (customerId: string): Promise<Customer | null> => {
  return getBeachDatabase().getCustomer(customerId)
}

export const searchCustomers = async (query: string): Promise<Customer[]> => {
  return getBeachDatabase().searchCustomers(query)
}

export const getActiveCustomers = async (): Promise<Customer[]> => {
  return getBeachDatabase().getActiveCustomers()
}

export const assignCustomerToBeachItem = async (
  itemId: string,
  customerId: string,
  assignmentType: CustomerAssignmentType,
  note?: string,
): Promise<void> => {
  await getBeachDatabase().assignCustomerToBeachItem(itemId, customerId, assignmentType, note)
}

export const unassignCustomerFromBeachItem = async (itemId: string): Promise<void> => {
  await getBeachDatabase().unassignCustomerFromBeachItem(itemId)
}

export const getAssignedCustomerForItem = async (
  itemId: string,
): Promise<BeachItemAssignedCustomer | null> => {
  return getBeachDatabase().getAssignedCustomerForItem(itemId)
}

export const getAssignedCustomersForItems = async (
  itemIds: string[],
): Promise<BeachItemAssignedCustomer[]> => {
  return getBeachDatabase().getAssignedCustomersForItems(itemIds)
}

export const getCustomerAssignments = async (
  customerId: string,
): Promise<BeachItemCustomerAssignment[]> => {
  return getBeachDatabase().getCustomerAssignments(customerId)
}
