<script lang="ts">
  import {
    employeeAssignmentLabels,
    employeeRoleLabels,
    employeeStatusLabels,
    type EmployeeRecord,
  } from './employeeModel'

  let {
    employee,
  }: {
    employee: EmployeeRecord | null
  } = $props()
</script>

<aside class="employee-detail-panel" aria-label="Scheda dipendente">
  <header class="employees-surface-header">
    <span>Scheda operativa</span>
    <strong>{employee?.name ?? 'Nessuna selezione'}</strong>
  </header>

  {#if employee}
    <dl class="employee-detail-list">
      <div>
        <dt>Ruolo</dt>
        <dd>{employeeRoleLabels[employee.role]}</dd>
      </div>
      <div>
        <dt>Stato</dt>
        <dd>{employeeStatusLabels[employee.status]}</dd>
      </div>
      <div>
        <dt>Assegnazione</dt>
        <dd>{employeeAssignmentLabels[employee.assignedArea]}</dd>
      </div>
      <div>
        <dt>Turno</dt>
        <dd>{employee.activeShift ?? 'Non impostato'}</dd>
      </div>
      <div>
        <dt>Contatto</dt>
        <dd>{employee.phone ?? employee.email ?? 'Non indicato'}</dd>
      </div>
      <div>
        <dt>Note</dt>
        <dd>{employee.notes ?? 'Nessuna nota operativa.'}</dd>
      </div>
    </dl>

    <div class="employee-detail-actions" aria-label="Azioni scheda dipendente">
      <button type="button" disabled title="Modifica dipendente non attiva in questa wave.">
        Modifica
      </button>
      <button type="button" disabled title="Cambio stato non attivo in questa wave.">
        Cambia stato
      </button>
      <button type="button" disabled title="Assegnazione operativa non attiva in questa wave.">
        Assegna
      </button>
    </div>
  {:else}
    <div class="employee-detail-empty">
      <strong>Seleziona un dipendente</strong>
      <p>
        La scheda mostra ruolo, stato, contatto e assegnazione operativa. Paghe, contratti
        e timbrature non sono gestiti in questa build.
      </p>
    </div>
  {/if}
</aside>
