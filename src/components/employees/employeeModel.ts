export type EmployeeRole =
  | 'responsabile'
  | 'spiaggia'
  | 'bar'
  | 'cassa'
  | 'pulizie'
  | 'manutenzione'
  | 'altro'

export type EmployeeStatus =
  | 'attivo'
  | 'non-disponibile'
  | 'in-turno'
  | 'fuori-turno'
  | 'archiviato'

export type EmployeeAssignment =
  | 'spiaggia'
  | 'bar'
  | 'cassa'
  | 'generale'
  | 'nessuna'

export type EmployeeRecord = {
  id: string
  name: string
  role: EmployeeRole
  status: EmployeeStatus
  phone?: string
  email?: string
  assignedArea: EmployeeAssignment
  activeShift?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export type EmployeeSummary = {
  total: number
  active: number
  onShift: number
  assignedBeach: number
  assignedBar: number
}

export const employeeRoles: EmployeeRole[] = [
  'responsabile',
  'spiaggia',
  'bar',
  'cassa',
  'pulizie',
  'manutenzione',
  'altro',
]

export const employeeStatuses: EmployeeStatus[] = [
  'attivo',
  'in-turno',
  'fuori-turno',
  'non-disponibile',
  'archiviato',
]

export const employeeAssignments: EmployeeAssignment[] = [
  'spiaggia',
  'bar',
  'cassa',
  'generale',
  'nessuna',
]

export const employeeRoleLabels: Record<EmployeeRole, string> = {
  responsabile: 'Responsabile',
  spiaggia: 'Spiaggia',
  bar: 'Bar',
  cassa: 'Cassa',
  pulizie: 'Pulizie',
  manutenzione: 'Manutenzione',
  altro: 'Altro',
}

export const employeeStatusLabels: Record<EmployeeStatus, string> = {
  attivo: 'Attivo',
  'non-disponibile': 'Non disponibile',
  'in-turno': 'In turno',
  'fuori-turno': 'Fuori turno',
  archiviato: 'Archiviato',
}

export const employeeAssignmentLabels: Record<EmployeeAssignment, string> = {
  spiaggia: 'Spiaggia',
  bar: 'Bar',
  cassa: 'Cassa',
  generale: 'Generale',
  nessuna: 'Nessuna assegnazione',
}

export const buildEmployeeSummary = (employees: EmployeeRecord[]): EmployeeSummary => ({
  total: employees.length,
  active: employees.filter((employee) => employee.status === 'attivo' || employee.status === 'in-turno').length,
  onShift: employees.filter((employee) => employee.status === 'in-turno').length,
  assignedBeach: employees.filter((employee) => employee.assignedArea === 'spiaggia').length,
  assignedBar: employees.filter((employee) => employee.assignedArea === 'bar').length,
})

const normalizeSearch = (value: string) => value.trim().toLowerCase()

export const filterEmployees = (
  employees: EmployeeRecord[],
  filters: {
    searchQuery: string
    role: EmployeeRole | 'all'
    status: EmployeeStatus | 'all'
    assignment: EmployeeAssignment | 'all'
  },
) => {
  const query = normalizeSearch(filters.searchQuery)

  return employees.filter((employee) => {
    const searchText = [
      employee.name,
      employeeRoleLabels[employee.role],
      employeeStatusLabels[employee.status],
      employeeAssignmentLabels[employee.assignedArea],
      employee.phone,
      employee.email,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return (
      (query.length === 0 || searchText.includes(query)) &&
      (filters.role === 'all' || employee.role === filters.role) &&
      (filters.status === 'all' || employee.status === filters.status) &&
      (filters.assignment === 'all' || employee.assignedArea === filters.assignment)
    )
  })
}
