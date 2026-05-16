<script lang="ts">
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import { getBeachItemUsageTypeLabel } from '../../lib/format/beachLabels'
  import type { BeachItemAssignedCustomer } from '../../lib/types/customer'

  let {
    assignedCustomer,
  }: {
    assignedCustomer: BeachItemAssignedCustomer
  } = $props()
</script>

<div class="customer-summary">
  <strong>{assignedCustomer.customer.fullName}</strong>
  {#if assignedCustomer.customer.phone}
    <span>{assignedCustomer.customer.phone}</span>
  {/if}
  <span>
    {getBeachItemUsageTypeLabel(assignedCustomer.assignment.assignmentType)}
    · assegnato {formatCompactDateTime(assignedCustomer.assignment.assignedAt)}
  </span>
  {#if assignedCustomer.assignment.note}
    <p>{assignedCustomer.assignment.note}</p>
  {/if}
</div>
