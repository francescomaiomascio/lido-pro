export type CustomerAssignmentType = 'daily' | 'seasonal'

export type CustomerInput = {
  fullName: string
  phone?: string | null
  email?: string | null
  notes?: string | null
}

export interface Customer {
  id: string
  fullName: string
  phone?: string | null
  email?: string | null
  notes?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface BeachItemCustomerAssignment {
  id: string
  itemId: string
  customerId: string
  assignmentType: CustomerAssignmentType
  active: boolean
  assignedAt: string
  unassignedAt?: string | null
  note?: string | null
  createdAt: string
  updatedAt: string
}

export interface BeachItemAssignedCustomer {
  itemId: string
  customer: Customer
  assignment: BeachItemCustomerAssignment
}
