<script lang="ts">
  import {
    employeeAssignmentLabels,
    employeeRoleLabels,
    employeeStatusLabels,
    type EmployeeRecord,
  } from './employeeModel'

  let {
    employees,
    selectedEmployeeId,
    onSelectEmployee,
  }: {
    employees: EmployeeRecord[]
    selectedEmployeeId: string | null
    onSelectEmployee: (employeeId: string) => void
  } = $props()

  const contactLabel = (employee: EmployeeRecord) =>
    employee.phone ?? employee.email ?? 'Non indicato'
</script>

<section class="employees-table-surface" aria-label="Tabella dipendenti">
  <header class="employees-surface-header">
    <span>Archivio staff</span>
    <strong>{employees.length} record</strong>
  </header>

  <div class="employees-table-wrap">
    <table class="employees-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Ruolo</th>
          <th>Stato</th>
          <th>Assegnazione</th>
          <th>Contatto</th>
          <th>Ultimo aggiornamento</th>
          <th>Azione</th>
        </tr>
      </thead>
      <tbody>
        {#if employees.length === 0}
          <tr class="employees-empty-row">
            <td colspan="7">Nessun dipendente registrato.</td>
          </tr>
        {:else}
          {#each employees as employee}
            <tr class:selected={employee.id === selectedEmployeeId}>
              <td data-label="Nome">{employee.name}</td>
              <td data-label="Ruolo">{employeeRoleLabels[employee.role]}</td>
              <td data-label="Stato">{employeeStatusLabels[employee.status]}</td>
              <td data-label="Assegnazione">{employeeAssignmentLabels[employee.assignedArea]}</td>
              <td data-label="Contatto">{contactLabel(employee)}</td>
              <td data-label="Ultimo aggiornamento">{employee.updatedAt ?? 'N/D'}</td>
              <td data-label="Azione">
                <button type="button" onclick={() => onSelectEmployee(employee.id)}>
                  Apri scheda
                </button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</section>
