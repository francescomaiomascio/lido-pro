<script lang="ts">
  import EmployeeDetailPanel from './EmployeeDetailPanel.svelte'
  import EmployeesTable from './EmployeesTable.svelte'
  import {
    buildEmployeeSummary,
    employeeAssignmentLabels,
    employeeAssignments,
    employeeRoleLabels,
    employeeRoles,
    employeeStatusLabels,
    employeeStatuses,
    filterEmployees,
    type EmployeeAssignment,
    type EmployeeRecord,
    type EmployeeRole,
    type EmployeeStatus,
  } from './employeeModel'

  let employees: EmployeeRecord[] = $state([])
  let selectedEmployeeId: string | null = $state(null)
  let searchQuery = $state('')
  let roleFilter: EmployeeRole | 'all' = $state('all')
  let statusFilter: EmployeeStatus | 'all' = $state('all')
  let assignmentFilter: EmployeeAssignment | 'all' = $state('all')

  const filteredEmployees = $derived(
    filterEmployees(employees, {
      searchQuery,
      role: roleFilter,
      status: statusFilter,
      assignment: assignmentFilter,
    }),
  )
  const summary = $derived(buildEmployeeSummary(employees))
  const selectedEmployee = $derived(
    employees.find((employee) => employee.id === selectedEmployeeId) ?? null,
  )

  const selectEmployee = (employeeId: string) => {
    selectedEmployeeId = employeeId
  }

  const resetFilters = () => {
    searchQuery = ''
    roleFilter = 'all'
    statusFilter = 'all'
    assignmentFilter = 'all'
  }
</script>

<section class="employees-workspace" aria-label="Dipendenti">
  <header class="employees-header">
    <div>
      <p>Modulo operativo</p>
      <h1>Dipendenti</h1>
      <span>Staff operativo, ruoli, disponibilita e assegnazioni locali.</span>
    </div>

    <dl class="employees-status-strip" aria-label="Stato dipendenti">
      <div>
        <dt>Registrati</dt>
        <dd>{summary.total}</dd>
      </div>
      <div>
        <dt>Attivi</dt>
        <dd>{summary.active}</dd>
      </div>
      <div>
        <dt>In turno</dt>
        <dd>{summary.onShift}</dd>
      </div>
      <div>
        <dt>Spiaggia</dt>
        <dd>{summary.assignedBeach}</dd>
      </div>
      <div>
        <dt>Bar</dt>
        <dd>{summary.assignedBar}</dd>
      </div>
    </dl>
  </header>

  <div class="employees-command-strip" aria-label="Comandi e filtri dipendenti">
    <button
      type="button"
      class="employees-primary-action"
      disabled
      title="Creazione dipendente non attiva in questa wave."
    >
      Nuovo dipendente
    </button>

    <label class="employees-search-field">
      <span>Cerca</span>
      <input
        type="search"
        bind:value={searchQuery}
        placeholder="Nome, ruolo o contatto"
        autocomplete="off"
      />
    </label>

    <label>
      <span>Ruolo</span>
      <select bind:value={roleFilter}>
        <option value="all">Tutti</option>
        {#each employeeRoles as role}
          <option value={role}>{employeeRoleLabels[role]}</option>
        {/each}
      </select>
    </label>

    <label>
      <span>Stato</span>
      <select bind:value={statusFilter}>
        <option value="all">Tutti</option>
        {#each employeeStatuses as status}
          <option value={status}>{employeeStatusLabels[status]}</option>
        {/each}
      </select>
    </label>

    <label>
      <span>Area</span>
      <select bind:value={assignmentFilter}>
        <option value="all">Tutte</option>
        {#each employeeAssignments as assignment}
          <option value={assignment}>{employeeAssignmentLabels[assignment]}</option>
        {/each}
      </select>
    </label>

    <button type="button" class="employees-secondary-action" onclick={resetFilters}>
      Reset
    </button>
  </div>

  <div class="employees-content-grid">
    <EmployeesTable
      employees={filteredEmployees}
      {selectedEmployeeId}
      onSelectEmployee={selectEmployee}
    />
    <EmployeeDetailPanel employee={selectedEmployee} />
  </div>

  <section class="employees-foundation-strip" aria-label="Confini modulo dipendenti">
    <div>
      <span>Dominio</span>
      <strong>Operativo locale</strong>
      <em>Registry condivisa per Spiaggia, Bar, Cassa e servizi.</em>
    </div>
    <div>
      <span>Esclusioni</span>
      <strong>No paghe / contratti</strong>
      <em>Nessun workflow HR legale o salariale in questa wave.</em>
    </div>
    <div>
      <span>Registro</span>
      <strong>Fondazione pronta</strong>
      <em>Le future azioni potranno usare dominio staff/employees.</em>
    </div>
  </section>
</section>
